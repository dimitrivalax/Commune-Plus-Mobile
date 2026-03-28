/**
 * Service de gestion du localStorage pour les coordonnées utilisateur
 */

import { bumpCommuneFeaturesVersion } from '@/utils/commune-features-version'

const STORAGE_KEY = 'commune-plus-user-contact'

/**
 * Sauvegarde les coordonnées utilisateur dans le localStorage
 * @param {Object} contactData - Les données de contact à sauvegarder
 */
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

/**
 * @returns {Object|null}
 */
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

/**
 * Sauvegarde les informations de la commune dans le localStorage
 * @param {Object} cityData
 */
export const saveCityInfo = (cityData) => {
  try {
    const dataToSave = {
      name: cityData.name || '',
      postalCode: cityData.postalCode || '',
      email: cityData.email || '',
      logo: cityData.logo || cityData.logo_url || null,
      id: cityData.id || null,
      feature_reservations_salles: cityData.feature_reservations_salles !== false,
      feature_propositions: cityData.feature_propositions !== false
    }
    localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(dataToSave))
    bumpCommuneFeaturesVersion()
  } catch (error) {
    console.error('Error saving city info to localStorage:', error)
  }
}

/**
 * @returns {Object|null}
 */
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
  const { supabase } = await import('@/services/supabase')

  try {
    const cityInfo = getCityInfo()
    if (cityInfo && cityInfo.id) {
      return cityInfo.id
    }

    if (!cityInfo || !cityInfo.name || !cityInfo.postalCode) {
      return null
    }

    const { data, error } = await supabase
      .from('commune')
      .select(
        'id, feature_reservations_salles, feature_propositions'
      )
      .eq('name', cityInfo.name)
      .eq('postal_code', cityInfo.postalCode)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error getting city ID:', error)
      return null
    }

    if (data && data.id) {
      saveCityInfo({
        ...cityInfo,
        id: data.id,
        feature_reservations_salles: data.feature_reservations_salles !== false,
        feature_propositions: data.feature_propositions !== false
      })
      return data.id
    }

    return null
  } catch (error) {
    console.error('Error getting city ID from database:', error)
    return null
  }
}

export const isCityInfoComplete = () => {
  const cityInfo = getCityInfo()
  if (!cityInfo) return false

  return !!(cityInfo.name && cityInfo.postalCode && cityInfo.email)
}

/**
 * Met à jour le localStorage depuis Supabase pour l'ID de commune courant (flags inclus).
 * @returns {Promise<Object|null>}
 */
export const refreshCityInfoFromDatabase = async () => {
  const cityInfo = getCityInfo()
  if (!cityInfo?.id) return null

  const { supabase } = await import('@/services/supabase')

  try {
    const { data, error } = await supabase
      .from('commune')
      .select('*')
      .eq('id', cityInfo.id)
      .maybeSingle()

    if (error || !data) return null

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
  const { supabase } = await import('@/services/supabase')

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

    const { data: existingData, error: checkError } = await supabase
      .from('commune')
      .select('id')
      .eq('name', dataToSave.name)
      .eq('postal_code', dataToSave.postal_code)
      .limit(1)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing city:', checkError)
      throw new Error(`Erreur lors de la vérification: ${checkError.message}`)
    }

    let result

    if (existingData && existingData.id) {
      const { data, error } = await supabase
        .from('commune')
        .update(dataToSave)
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating city info:', error)
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`)
      }

      if (!data) {
        throw new Error('Aucune donnée retournée après la mise à jour')
      }

      result = data
    } else {
      const insertData = {
        name: dataToSave.name,
        postal_code: dataToSave.postal_code,
        email: dataToSave.email,
        logo_url: dataToSave.logo_url
      }

      console.log('Inserting city info:', insertData)

      const { data, error } = await supabase
        .from('commune')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error inserting city info:', error)
        throw new Error(`Erreur lors de l'insertion: ${error.message}`)
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après l'insertion")
      }

      result = data
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
  const { supabase } = await import('@/services/supabase')

  try {
    const { data, error } = await supabase
      .from('commune')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

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
  const { supabase } = await import('@/services/supabase')

  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return []
    }

    const search = searchTerm.trim()

    const { data, error } = await supabase
      .from('commune')
      .select(
        'id, name, postal_code, email, logo_url, feature_reservations_salles, feature_propositions'
      )
      .or(`name.ilike.%${search}%,postal_code.ilike.%${search}%`)
      .limit(10)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching cities:', error)
      return []
    }

    return (data || []).map((city) => ({
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
