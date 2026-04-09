import { collection, getDocs, query, where } from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'

const db = () => getFirestoreDb()

function asIso(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return String(value)
}

export const InformationCommuneService = {
  async getAll(communeId = null) {
    if (!communeId) return { data: [], error: null }
    try {
      const ref = collection(db(), 'information_commune')
      const snap = await getDocs(query(ref, where('commune_id', 'in', [communeId, null])))
      const rows = snap.docs
        .map((d) => docToPlain(d.id, d.data()))
        .filter((row) => row?.published === true)
      rows.sort((a, b) => {
        const ao = Number(a?.ordre_affichage ?? 1)
        const bo = Number(b?.ordre_affichage ?? 1)
        if (ao !== bo) return ao - bo
        return asIso(b.updated_at || b.created_at).localeCompare(asIso(a.updated_at || a.created_at))
      })
      return { data: rows, error: null }
    } catch (error) {
      console.error('Error loading information_commune:', error)
      return { data: [], error }
    }
  },
}
