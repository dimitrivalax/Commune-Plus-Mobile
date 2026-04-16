import { Timestamp } from 'firebase/firestore'

/** Normalise les champs Firestore pour l’app (Timestamps → ISO). */
export function docToPlain(id, data) {
  if (!data) return null
  const o = { id, ...data }
  for (const k of Object.keys(o)) {
    const v = o[k]
    if (v instanceof Timestamp) o[k] = v.toDate().toISOString()
  }
  return o
}
