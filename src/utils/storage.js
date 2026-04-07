/**
 * Service de gestion du localStorage pour les coordonnées utilisateur
 * et synchronisation Firestore (communes).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { bumpCommuneFeaturesVersion } from '@/utils/commune-features-version'
import { getFirestoreDb } from '@/services/firebase'
import { docToPlain } from '@/utils/firestore'

const db = () => getFirestoreDb()

const STORAGE_KEY = 'commune-plus-user-contact'

export const saveUserContact = (contactData) => {
  try {
    const dataToSave = {
      firstName: contactData.firstName || '',
      lastName: contactData.lastName || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      address: contactData.address || ''
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Error saving user contact to localStorage:', error)
  }
}

export const getUserContact = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored)
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || ''
    }
  } catch (error) {
    console.error('Error reading user contact from localStorage:', error)
    return null
  }
}

export const clearUserContact = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user contact from localStorage:', error)
  }
}

const CITY_STORAGE_KEY = 'commune-plus-city-info'

export const saveCityInfo = (cityData) => {
  try {
    const dataToSave = {
      name: cityData.name || '',
      postalCode: cityData.postalCode || '',
      email: cityData.email || '',
      logo: cityData.logo || cityData.logo_url || null,
      id: cityData.id || null,
      feature_reservations_salles:
        cityData.feature_reservations_salles !== false,
      feature_propositions: cityData.feature_propositions !== false
    }
    localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(dataToSave))
    bumpCommuneFeaturesVersion()
  } catch (error) {
    console.error('Error saving city info to localStorage:', error)
  }
}

export const getCityInfo = () => {
  try {
    const stored = localStorage.getItem(CITY_STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored)
    return {
      name: data.name || '',
      postalCode: data.postalCode || '',
      email: data.email || '',
      logo: data.logo || null,
      id: data.id || null,
      feature_reservations_salles: data.feature_reservations_salles !== false,
      feature_propositions: data.feature_propositions !== false
    }
  } catch (error) {
    console.error('Error reading city info from localStorage:', error)
    return null
  }
}

export const getCityIdFromDatabase = async () => {
  try {
    const cityInfo = getCityInfo()
    if (cityInfo && cityInfo.id) {
      return cityInfo.id
    }

    if (!cityInfo || !cityInfo.name || !cityInfo.postalCode) {
      return null
    }

    const ref = collection(db(), 'commune')
    const qy = query(
      ref,
      where('name', '==', cityInfo.name.trim()),
      where('postal_code', '==', String(cityInfo.postalCode).trim()),
      limit(1)
    )
    const snap = await getDocs(qy)

    if (snap.empty) {
      return null
    }

    const d = snap.docs[0]
    const row = docToPlain(d.id, d.data())
    saveCityInfo({
      ...cityInfo,
      id: row.id,
      feature_reservations_salles: row.feature_reservations_salles !== false,
      feature_propositions: row.feature_propositions !== false
    })
    return row.id
  } catch (error) {
    console.error('Error getting city ID:', error)
    return null
  }
}

export const isCityInfoComplete = () => {
  const cityInfo = getCityInfo()
  if (!cityInfo) return false

  return !!(cityInfo.name && cityInfo.postalCode && cityInfo.email)
}

export const refreshCityInfoFromDatabase = async () => {
  const cityInfo = getCityInfo()
  if (!cityInfo?.id) return null

  try {
    const dref = doc(db(), 'commune', cityInfo.id)
    const snap = await getDoc(dref)
    if (!snap.exists()) return null

    const data = docToPlain(snap.id, snap.data())
    const merged = {
      name: data.name || cityInfo.name,
      postalCode: data.postal_code || cityInfo.postalCode,
      email: data.email || cityInfo.email,
      logo: data.logo_url ?? cityInfo.logo,
      id: data.id,
      feature_reservations_salles: data.feature_reservations_salles !== false,
      feature_propositions: data.feature_propositions !== false
    }
    saveCityInfo(merged)
    return merged
  } catch (error) {
    console.error('Error refreshing city info:', error)
    return null
  }
}

export const saveCityInfoToDatabase = async (cityData) => {
  try {
    const dataToSave = {
      name: (cityData.name || '').trim(),
      postal_code: (cityData.postalCode || '').trim(),
      email: (cityData.email || '').trim(),
      logo_url: (cityData.logo || cityData.logo_url || '').trim() || null
    }

    if (!dataToSave.name || !dataToSave.postal_code || !dataToSave.email) {
      throw new Error('Tous les champs sont requis (nom, code postal, email)')
    }

    const ref = collection(db(), 'commune')
    const qy = query(
      ref,
      where('name', '==', dataToSave.name),
      where('postal_code', '==', dataToSave.postal_code),
      limit(1)
    )
    const existingSnap = await getDocs(qy)

    let result

    if (!existingSnap.empty) {
      const id = existingSnap.docs[0].id
      const pref = doc(db(), 'commune', id)
      await updateDoc(pref, {
        name: dataToSave.name,
        postal_code: dataToSave.postal_code,
        email: dataToSave.email,
        logo_url: dataToSave.logo_url,
        updated_at: serverTimestamp()
      })
      const snap = await getDoc(pref)
      result = docToPlain(snap.id, snap.data())
    } else {
      const newRef = await addDoc(ref, {
        name: dataToSave.name,
        postal_code: dataToSave.postal_code,
        email: dataToSave.email,
        logo_url: dataToSave.logo_url,
        feature_reservations_salles: true,
        feature_propositions: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      const snap = await getDoc(newRef)
      result = docToPlain(snap.id, snap.data())
    }

    saveCityInfo({
      ...cityData,
      id: result.id,
      feature_reservations_salles: result.feature_reservations_salles !== false,
      feature_propositions: result.feature_propositions !== false
    })

    return result
  } catch (error) {
    console.error('Error saving city info to database:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    saveCityInfo(cityData)
    throw error
  }
}

export const getCityInfoFromDatabase = async () => {
  try {
    const snap = await getDocs(query(collection(db(), 'commune'), limit(1)))
    if (snap.empty) return null

    const d = snap.docs[0]
    const data = docToPlain(d.id, d.data())
    if (!data) return null

    const cityInfo = {
      name: data.name || '',
      postalCode: data.postal_code || '',
      email: data.email || '',
      logo: data.logo_url || null,
      id: data.id || null,
      feature_reservations_salles: data.feature_reservations_salles !== false,
      feature_propositions: data.feature_propositions !== false
    }

    saveCityInfo(cityInfo)

    return cityInfo
  } catch (error) {
    console.error('Error reading city info from database:', error)
    return getCityInfo()
  }
}

export const searchCitiesInDatabase = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return []
    }

    const search = searchTerm.trim().toLowerCase()

    const snap = await getDocs(
      query(collection(db(), 'commune'), orderBy('name'), limit(500))
    )

    return snap.docs
      .map((d) => docToPlain(d.id, d.data()))
      .filter(
        (city) =>
          (city.name && String(city.name).toLowerCase().includes(search)) ||
          (city.postal_code &&
            String(city.postal_code).toLowerCase().includes(search))
      )
      .slice(0, 10)
      .map((city) => ({
        id: city.id,
        name: city.name || '',
        postalCode: city.postal_code || '',
        email: city.email || '',
        logo: city.logo_url || null,
        feature_reservations_salles: city.feature_reservations_salles !== false,
        feature_propositions: city.feature_propositions !== false
      }))
  } catch (error) {
    console.error('Error searching cities in database:', error)
    return []
  }
}
