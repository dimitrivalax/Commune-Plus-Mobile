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
  serverTimestamp
} from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'
import { normalizeServiceError } from '@/utils/service-error'

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

async function getVotesCountForProposition(propositionId) {
  const qy = query(
    collection(db(), 'proposition_vote'),
    where('proposition_id', '==', propositionId)
  )
  const snap = await getDocs(qy)
  return snap.size
}

async function getVotesCountMapForPropositions(propositionIds) {
  const ids = Array.from(
    new Set((propositionIds || []).filter((id) => typeof id === 'string' && id))
  )
  if (ids.length === 0) return {}

  const counts = {}
  ids.forEach((id) => {
    counts[id] = 0
  })

  // Firestore "in" supports a limited amount of values per query.
  const chunkSize = 10
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const qy = query(
      collection(db(), 'proposition_vote'),
      where('proposition_id', 'in', chunk)
    )
    const snap = await getDocs(qy)
    snap.docs.forEach((d) => {
      const pid = d.data()?.proposition_id
      if (typeof pid === 'string' && counts[pid] != null) {
        counts[pid] += 1
      }
    })
  }

  return counts
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

      const votesMap = await getVotesCountMapForPropositions(
        rows.map((row) => row.id)
      )
      rows = rows.map((row) => ({
        ...row,
        votes_count: votesMap[row.id] || 0
      }))

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
    } catch (error) {
      return { data: [], error: normalizeServiceError(error) }
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
      const votesCount = await getVotesCountForProposition(id)

      return {
        data: {
          ...proposition,
          votes_count: votesCount,
          comments,
          has_voted: hasVoted
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
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
    const propSnap = await getDoc(propRef)
    if (!propSnap.exists()) {
      return { data: null, error: { message: 'Proposition introuvable' } }
    }

    let alreadyVoted = false
    try {
      await runTransaction(db(), async (t) => {
        const voteSnap = await t.get(voteRef)
        if (voteSnap.exists()) {
          alreadyVoted = true
          return
        }
        t.set(voteRef, {
          proposition_id: propositionId,
          email: emailNormalized,
          created_at: serverTimestamp()
        })
      })
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
    }
    if (alreadyVoted) {
      return { data: null, error: { message: 'Already voted' } }
    }

    this.notify(propositionId, 'vote').catch((err) =>
      console.error('Notify error:', err)
    )
    const [snap, votesCount] = await Promise.all([
      getDoc(propRef),
      getVotesCountForProposition(propositionId)
    ])
    return {
      data: { ...docToPlain(snap.id, snap.data()), votes_count: votesCount },
      error: null
    }
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
    const propSnap = await getDoc(propRef)
    if (!propSnap.exists()) {
      return { data: null, error: { message: 'Proposition introuvable' } }
    }

    let noVote = false
    try {
      await runTransaction(db(), async (t) => {
        const voteSnap = await t.get(voteRef)
        if (!voteSnap.exists()) {
          noVote = true
          return
        }
        t.delete(voteRef)
      })
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
    }
    if (noVote) {
      return { data: null, error: { message: 'No vote to remove' } }
    }

    const [snap, votesCount] = await Promise.all([
      getDoc(propRef),
      getVotesCountForProposition(propositionId)
    ])
    return {
      data: { ...docToPlain(snap.id, snap.data()), votes_count: votesCount },
      error: null
    }
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
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
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
        return {
          data: null,
          error: { message: 'Vous ne pouvez modifier que vos commentaires' }
        }
      }
      await updateDoc(ref, {
        content: content.trim(),
        updated_at: serverTimestamp()
      })
      const updated = await getDoc(ref)
      return { data: docToPlain(updated.id, updated.data()), error: null }
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
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
