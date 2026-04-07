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

const db = () => getFirestoreDb()

export const SignalementService = {
  async create(data) {
    try {
      const ref = await addDoc(collection(db(), 'signalement'), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      const snap = await getDoc(ref)
      return { data: [docToPlain(snap.id, snap.data())], error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  async getMySignalementsInCommune(communeId, userEmail) {
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
  },

  async getById(id) {
    const dref = doc(db(), 'signalement', id)
    const d = await getDoc(dref)
    if (!d.exists()) return { data: null, error: { message: 'Not found' } }
    return { data: docToPlain(d.id, d.data()), error: null }
  },

  async update(id, updates) {
    const dref = doc(db(), 'signalement', id)
    await updateDoc(dref, {
      ...updates,
      updated_at: serverTimestamp()
    })
    const snap = await getDoc(dref)
    return { data: docToPlain(snap.id, snap.data()), error: null }
  },

  async archive(id) {
    return this.update(id, { status: 'archive' })
  }
}
