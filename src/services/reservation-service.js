import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'

const db = () => getFirestoreDb()

export const ReservationService = {
  async getMyReservationsInCommune(communeId, userEmail) {
    if (!communeId || !userEmail) {
      return { data: [], error: null }
    }
    const sallesQ = query(
      collection(db(), 'salle'),
      where('commune_id', '==', communeId)
    )
    const sallesSnap = await getDocs(sallesQ)
    const salleIds = sallesSnap.docs.map((d) => d.id)
    if (salleIds.length === 0) return { data: [], error: null }

    const normalizedEmail = userEmail.trim().toLowerCase()
    const all = []
    for (const sid of salleIds) {
      const rq = query(
        collection(db(), 'reservation_salle'),
        where('salle_id', '==', sid),
        where('email', '==', normalizedEmail)
      )
      const rs = await getDocs(rq)
      for (const d of rs.docs) {
        const plain = docToPlain(d.id, d.data())
        const sRef = doc(db(), 'salle', plain.salle_id)
        const sSnap = await getDoc(sRef)
        const salle = sSnap.exists() ? docToPlain(sSnap.id, sSnap.data()) : null
        all.push({
          ...plain,
          salle: salle ? { id: salle.id, nom: salle.nom } : null
        })
      }
    }
    all.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    return { data: all, error: null }
  },

  async getAll() {
    const snap = await getDocs(collection(db(), 'reservation_salle'))
    const list = []
    for (const d of snap.docs) {
      const plain = docToPlain(d.id, d.data())
      const sRef = doc(db(), 'salle', plain.salle_id)
      const sSnap = await getDoc(sRef)
      const salle = sSnap.exists() ? docToPlain(sSnap.id, sSnap.data()) : null
      list.push({
        ...plain,
        salle: salle ? { id: salle.id, nom: salle.nom } : null
      })
    }
    list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    return { data: list, error: null }
  },

  async getById(id) {
    const dref = doc(db(), 'reservation_salle', id)
    const d = await getDoc(dref)
    if (!d.exists()) return { data: null, error: { message: 'Not found' } }
    const plain = docToPlain(d.id, d.data())
    const sRef = doc(db(), 'salle', plain.salle_id)
    const sSnap = await getDoc(sRef)
    const salle = sSnap.exists() ? docToPlain(sSnap.id, sSnap.data()) : null
    return {
      data: {
        ...plain,
        salle: salle ? { id: salle.id, nom: salle.nom } : null
      },
      error: null
    }
  },

  async create(reservationData) {
    const ref = await addDoc(collection(db(), 'reservation_salle'), {
      ...reservationData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    })
    const snap = await getDoc(ref)
    return { data: docToPlain(snap.id, snap.data()), error: null }
  },

  async update(id, email, updates) {
    const dref = doc(db(), 'reservation_salle', id)
    const cur = await getDoc(dref)
    if (!cur.exists()) return { data: null, error: { message: 'Not found' } }
    if (String(cur.data().email || '').toLowerCase() !== email.toLowerCase()) {
      return { data: null, error: { message: 'Forbidden' } }
    }
    await updateDoc(dref, {
      ...updates,
      updated_at: serverTimestamp()
    })
    const snap = await getDoc(dref)
    return { data: docToPlain(snap.id, snap.data()), error: null }
  },

  async delete(id, email) {
    const dref = doc(db(), 'reservation_salle', id)
    const cur = await getDoc(dref)
    if (!cur.exists()) return { error: { message: 'Not found' } }
    if (String(cur.data().email || '').toLowerCase() !== email.toLowerCase()) {
      return { error: { message: 'Forbidden' } }
    }
    await deleteDoc(dref)
    return { error: null }
  },

  async getSalles(communeId = null) {
    let qy = query(collection(db(), 'salle'))
    if (communeId) {
      qy = query(collection(db(), 'salle'), where('commune_id', '==', communeId))
    }
    const snap = await getDocs(qy)
    const rows = snap.docs
      .map((d) => {
        const p = docToPlain(d.id, d.data())
        return { id: p.id, nom: p.nom, description: p.description }
      })
      .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'))
    return { data: rows, error: null }
  },

  async getReservationsBySalle(salleId) {
    const qy = query(
      collection(db(), 'reservation_salle'),
      where('salle_id', '==', salleId)
    )
    const snap = await getDocs(qy)
    const rows = snap.docs
      .map((d) => docToPlain(d.id, d.data()))
      .filter((r) =>
        ['en_attente', 'confirmée'].includes(String(r.status || ''))
      )
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    return { data: rows, error: null }
  }
}
