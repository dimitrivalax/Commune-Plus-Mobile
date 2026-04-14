import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'

const db = () => getFirestoreDb()

/** ID stable pour le doc de vote (proposition_id + email). */
function voteDocId(propositionId, emailNormalized) {
  const s = `${propositionId}\n${emailNormalized}`
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return `${propositionId}_v_${(h >>> 0).toString(16)}`
}

export const PropositionService = {
  async getAll(communeId, sortBy = 'updated_at') {
    try {
      const qy = query(
        collection(db(), 'proposition'),
        where('commune_id', '==', communeId)
      )
      const snap = await getDocs(qy)
      let rows = snap.docs
        .map((d) => docToPlain(d.id, d.data()))
        .filter((r) => !r.is_archived)
      if (sortBy === 'votes_count') {
        rows.sort(
          (a, b) => (Number(b.votes_count) || 0) - (Number(a.votes_count) || 0)
        )
      } else {
        rows.sort((a, b) =>
          String(b.updated_at || '').localeCompare(String(a.updated_at || ''))
        )
      }
      return { data: rows, error: null }
    } catch (e) {
      return { data: [], error: e }
    }
  },

  async getById(id, userEmail) {
    try {
      const psnap = await getDoc(doc(db(), 'proposition', id))
      if (!psnap.exists()) {
        return { data: null, error: { message: 'Not found' } }
      }
      const proposition = docToPlain(psnap.id, psnap.data())
      const emailNormalized =
        userEmail && typeof userEmail === 'string'
          ? userEmail.trim().toLowerCase()
          : null

      const cq = query(
        collection(db(), 'proposition_comment'),
        where('proposition_id', '==', id)
      )
      const csnap = await getDocs(cq)
      const comments = csnap.docs
        .map((d) => docToPlain(d.id, d.data()))
        .filter((comment) => {
          if (proposition.comments_public !== false) return true
          if (comment.author_type === 'commune') return true
          const email = (comment.user_email || '').trim().toLowerCase()
          return !!emailNormalized && email === emailNormalized
        })
        .sort((a, b) =>
          String(a.created_at || '').localeCompare(String(b.created_at || ''))
        )

      let hasVoted = false
      if (emailNormalized) {
        const vsnap = await getDoc(
          doc(db(), 'proposition_vote', voteDocId(id, emailNormalized))
        )
        hasVoted = vsnap.exists()
      }

      return {
        data: {
          ...proposition,
          comments,
          has_voted: hasVoted
        },
        error: null
      }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  async vote(propositionId, userEmail) {
    const emailNormalized =
      userEmail && typeof userEmail === 'string'
        ? userEmail.trim().toLowerCase()
        : null
    if (!emailNormalized) {
      return { data: null, error: { message: 'Email requis pour voter' } }
    }

    const vid = voteDocId(propositionId, emailNormalized)
    const voteRef = doc(db(), 'proposition_vote', vid)
    const propRef = doc(db(), 'proposition', propositionId)

    let alreadyVoted = false
    let propositionMissing = false
    try {
      await runTransaction(db(), async (t) => {
        const [voteSnap, propSnap] = await Promise.all([
          t.get(voteRef),
          t.get(propRef)
        ])
        if (!propSnap.exists()) {
          propositionMissing = true
          return
        }
        if (voteSnap.exists()) {
          alreadyVoted = true
          return
        }
        t.set(voteRef, {
          proposition_id: propositionId,
          email: emailNormalized,
          created_at: serverTimestamp()
        })
        t.update(propRef, {
          votes_count: increment(1),
          updated_at: serverTimestamp()
        })
      })
    } catch (e) {
      return { data: null, error: e }
    }
    if (propositionMissing) {
      return { data: null, error: { message: 'Proposition introuvable' } }
    }
    if (alreadyVoted) {
      return { data: null, error: { message: 'Already voted' } }
    }

    this.notify(propositionId, 'vote').catch((err) =>
      console.error('Notify error:', err)
    )
    const snap = await getDoc(propRef)
    return { data: docToPlain(snap.id, snap.data()), error: null }
  },

  async unvote(propositionId, userEmail) {
    const emailNormalized =
      userEmail && typeof userEmail === 'string'
        ? userEmail.trim().toLowerCase()
        : null
    if (!emailNormalized) {
      return { data: null, error: { message: 'Email requis' } }
    }

    const vid = voteDocId(propositionId, emailNormalized)
    const voteRef = doc(db(), 'proposition_vote', vid)
    const propRef = doc(db(), 'proposition', propositionId)

    let noVote = false
    let propositionMissing = false
    try {
      await runTransaction(db(), async (t) => {
        const voteSnap = await t.get(voteRef)
        if (!voteSnap.exists()) {
          noVote = true
          return
        }
        const propSnap = await t.get(propRef)
        if (!propSnap.exists()) {
          propositionMissing = true
          return
        }
        t.delete(voteRef)
        const prev = propSnap.data().votes_count || 0
        const newCount = Math.max(0, prev - 1)
        t.update(propRef, {
          votes_count: newCount,
          updated_at: serverTimestamp()
        })
      })
    } catch (e) {
      return { data: null, error: e }
    }
    if (propositionMissing) {
      return { data: null, error: { message: 'Proposition introuvable' } }
    }
    if (noVote) {
      return { data: null, error: { message: 'No vote to remove' } }
    }

    const snap = await getDoc(propRef)
    return { data: docToPlain(snap.id, snap.data()), error: null }
  },

  async addComment(commentData) {
    try {
      const cref = await addDoc(collection(db(), 'proposition_comment'), {
        ...commentData,
        author_type: 'user',
        updated_at: serverTimestamp(),
        created_at: serverTimestamp()
      })
      const snap = await getDoc(cref)
      const row = docToPlain(snap.id, snap.data())
      if (row) {
        this.notify(
          commentData.proposition_id,
          'comment',
          commentData.content
        ).catch((err) => console.error('Notify error:', err))
      }
      return { data: row, error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  async updateComment(id, content, userEmail) {
    try {
      const ref = doc(db(), 'proposition_comment', id)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        return { data: null, error: { message: 'Commentaire introuvable' } }
      }
      const existing = docToPlain(snap.id, snap.data())
      const ownerEmail = (existing?.user_email || '').trim().toLowerCase()
      const emailNormalized = (userEmail || '').trim().toLowerCase()
      if (!emailNormalized || ownerEmail !== emailNormalized) {
        return { data: null, error: { message: 'Vous ne pouvez modifier que vos commentaires' } }
      }
      await updateDoc(ref, {
        content: content.trim(),
        updated_at: serverTimestamp(),
      })
      const updated = await getDoc(ref)
      return { data: docToPlain(updated.id, updated.data()), error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  async notify(propositionId, type, commentContent) {
    try {
      const apiUrl = import.meta.env.VITE_BACKOFFICE_API_URL
      if (!apiUrl) {
        console.warn(
          'VITE_BACKOFFICE_API_URL not defined, skipping notification'
        )
        return
      }

      const body = {
        proposition_id: propositionId,
        type
      }
      if (commentContent != null && commentContent !== '') {
        body.comment_content = commentContent
      }
      await fetch(`${apiUrl}/api/propositions/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
    } catch (error) {
      console.error('Failed to send notification via BackOffice API:', error)
    }
  }
}
