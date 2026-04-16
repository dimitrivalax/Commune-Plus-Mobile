import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'
import { normalizeServiceError } from '@/utils/service-error'

const db = () => getFirestoreDb()

async function notifyBackofficeSignalement(signalement) {
  const apiUrl = import.meta.env.VITE_BACKOFFICE_API_URL
  if (!apiUrl || !signalement?.id) return

  const requesterName = `${String(
    signalement.first_name || ''
  ).trim()} ${String(signalement.last_name || '').trim()}`.trim()
  const baseUrl = String(apiUrl).replace(/\/+$/, '')
  const endpoints = [
    `${baseUrl}/api/backoffice-notifications/notify`,
    `${baseUrl}/backoffice-notifications/notify`
  ]

  let lastError = null
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'signalement',
          entity_id: String(signalement.id),
          title: 'Nouveau signalement',
          message: requesterName
            ? `${requesterName} a envoyé un signalement`
            : 'Un nouveau signalement a été créé',
          requester_name: requesterName || undefined
        })
      })

      if (response.ok) {
        return
      }

      const responseText = await response.text().catch(() => '')
      lastError = new Error(
        `HTTP ${response.status} on ${endpoint}${responseText ? ` - ${responseText}` : ''}`
      )
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    console.error(
      'Failed to send backoffice signalement notification:',
      lastError
    )
  }
}

export const SignalementService = {
  async create(data) {
    try {
      const ref = await addDoc(collection(db(), 'signalement'), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      const snap = await getDoc(ref)
      const created = docToPlain(snap.id, snap.data())
      if (created) {
        await notifyBackofficeSignalement(created)
      }
      return { data: [created], error: null }
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
    }
  },

  async getMySignalementsInCommune(communeId, userEmail) {
    try {
      if (!communeId || !userEmail) {
        return { data: [], error: null }
      }
      const normalizedEmail = userEmail.trim().toLowerCase()
      const qy = query(
        collection(db(), 'signalement'),
        where('city_id', '==', communeId)
      )
      const snap = await getDocs(qy)
      const rows = snap.docs
        .map((d) => docToPlain(d.id, d.data()))
        .filter(
          (r) =>
            String(r.email || '')
              .trim()
              .toLowerCase() === normalizedEmail
        )
        .sort((a, b) =>
          String(b.created_at || '').localeCompare(String(a.created_at || ''))
        )
      return { data: rows, error: null }
    } catch (error) {
      return { data: [], error: normalizeServiceError(error) }
    }
  },

  async getById(id) {
    try {
      const dref = doc(db(), 'signalement', id)
      const d = await getDoc(dref)
      if (!d.exists()) return { data: null, error: { message: 'Not found' } }
      return { data: docToPlain(d.id, d.data()), error: null }
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
    }
  },

  async update(id, updates) {
    try {
      const dref = doc(db(), 'signalement', id)
      await updateDoc(dref, {
        ...updates,
        updated_at: serverTimestamp()
      })
      const snap = await getDoc(dref)
      return { data: docToPlain(snap.id, snap.data()), error: null }
    } catch (error) {
      return { data: null, error: normalizeServiceError(error) }
    }
  },

  async archive(id) {
    return this.update(id, { status: 'archive' })
  }
}
