import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'

const db = () => getFirestoreDb()

const INITIAL_FUTURE = 10
const LOAD_MORE_SIZE = 10

function eventDateString(row) {
  const v = row.event_date
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v?.toDate === 'function') {
    const d = v.toDate()
    return d.toISOString().split('T')[0]
  }
  return String(v)
}

function isPublished(row) {
  const status = row?.publication_status
  if (typeof status === 'string') {
    return status === 'published'
  }
  return true
}

async function fetchForCommune(communeId) {
  const ref = collection(db(), 'actualite')
  const snap = await getDocs(
    query(ref, where('commune_id', 'in', [communeId, null]))
  )
  return snap.docs
    .map((d) => docToPlain(d.id, d.data()))
    .filter((row) => isPublished(row))
}

export const InformationService = {
  async getAll(communeId = null) {
    if (!communeId) {
      return { data: [], error: null }
    }
    try {
      const rows = await fetchForCommune(communeId)
      rows.sort((a, b) => eventDateString(b).localeCompare(eventDateString(a)))
      return { data: rows, error: null }
    } catch (e) {
      return { data: [], error: e }
    }
  },

  async getInitial(communeId = null, todayIso = null) {
    if (!communeId) {
      return { data: [], error: null, hasMoreOlder: false, hasMoreNewer: false }
    }
    const today = todayIso || new Date().toISOString().split('T')[0]
    try {
      const rows = await fetchForCommune(communeId)
      const future = rows
        .filter((r) => eventDateString(r) >= today)
        .sort((a, b) => eventDateString(a).localeCompare(eventDateString(b)))
      const list = future.slice(0, INITIAL_FUTURE)
      return {
        data: list,
        error: null,
        hasMoreOlder: true,
        hasMoreNewer: list.length === INITIAL_FUTURE
      }
    } catch (e) {
      return {
        data: [],
        error: e,
        hasMoreOlder: false,
        hasMoreNewer: false
      }
    }
  },

  async getOlderThan(communeId, beforeDateIso, limit = LOAD_MORE_SIZE) {
    if (!communeId) {
      return { data: [], error: null, hasMore: false }
    }
    try {
      const rows = await fetchForCommune(communeId)
      const older = rows
        .filter((r) => eventDateString(r) < beforeDateIso)
        .sort((a, b) => eventDateString(b).localeCompare(eventDateString(a)))
      const list = older.slice(0, limit)
      const ascending = [...list].reverse()
      return {
        data: ascending,
        error: null,
        hasMore: list.length === limit
      }
    } catch (e) {
      return { data: [], error: e, hasMore: false }
    }
  },

  async getNewerThan(communeId, afterDateIso, limit = LOAD_MORE_SIZE) {
    if (!communeId) {
      return { data: [], error: null, hasMore: false }
    }
    try {
      const rows = await fetchForCommune(communeId)
      const newer = rows
        .filter((r) => eventDateString(r) > afterDateIso)
        .sort((a, b) => eventDateString(a).localeCompare(eventDateString(b)))
      const list = newer.slice(0, limit)
      return { data: list, error: null, hasMore: list.length === limit }
    } catch (e) {
      return { data: [], error: e, hasMore: false }
    }
  },

  async getById(id, communeId = null) {
    if (!communeId) {
      return { data: null, error: { message: 'Commune non sélectionnée' } }
    }
    try {
      const dref = doc(db(), 'actualite', id)
      const snap = await getDoc(dref)
      if (!snap.exists()) {
        return { data: null, error: { message: 'Not found' } }
      }
      const row = docToPlain(snap.id, snap.data())
      const cid = row.commune_id
      const ok =
        cid === communeId || cid === null || cid === undefined || cid === ''
      if (!ok || !isPublished(row)) {
        return { data: null, error: { message: 'Forbidden' } }
      }
      return { data: row, error: null }
    } catch (e) {
      return { data: null, error: e }
    }
  }
}
