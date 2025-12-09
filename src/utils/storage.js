/**
 * Service de gestion du localStorage pour les coordonnées utilisateur
 */

const STORAGE_KEY = 'ok-mairie-user-contact'

/**
 * Structure des données sauvegardées :
 * {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   phone: string,
 *   address: string (optionnel, pour le fallback)
 * }
 */

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
 * Récupère les coordonnées utilisateur depuis le localStorage
 * @returns {Object|null} Les données de contact ou null si aucune donnée n'est trouvée
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

/**
 * Supprime les coordonnées utilisateur du localStorage
 */
export const clearUserContact = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user contact from localStorage:', error)
  }
}

/**
 * Service de gestion du localStorage pour les informations de la commune
 */

const CITY_STORAGE_KEY = 'ok-mairie-city-info'

/**
 * Structure des données sauvegardées :
 * {
 *   name: string,
 *   postalCode: string,
 *   email: string
 * }
 */

/**
 * Sauvegarde les informations de la commune dans le localStorage
 * @param {Object} cityData - Les données de la commune à sauvegarder
 */
export const saveCityInfo = (cityData) => {
  try {
    const dataToSave = {
      name: cityData.name || '',
      postalCode: cityData.postalCode || '',
      email: cityData.email || '',
      id: cityData.id || null // Sauvegarder aussi l'ID si disponible
    }
    localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Error saving city info to localStorage:', error)
  }
}

/**
 * Récupère les informations de la commune depuis le localStorage
 * @returns {Object|null} Les données de la commune ou null si aucune donnée n'est trouvée
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
      id: data.id || null
    }
  } catch (error) {
    console.error('Error reading city info from localStorage:', error)
    return null
  }
}

/**
 * Récupère l'ID de la commune depuis la base de données en utilisant les informations du localStorage
 * @returns {Promise<string|null>} L'ID de la commune ou null si non trouvée
 */
export const getCityIdFromDatabase = async () => {
  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { supabase } = await import('@/services/supabase')
  
  try {
    // D'abord vérifier si on a déjà l'ID dans le localStorage
    const cityInfo = getCityInfo()
    if (cityInfo && cityInfo.id) {
      return cityInfo.id
    }

    // Sinon, chercher dans la base de données avec le nom et le code postal
    if (!cityInfo || !cityInfo.name || !cityInfo.postalCode) {
      return null
    }

    const { data, error } = await supabase
      .from('city_info')
      .select('id')
      .eq('name', cityInfo.name)
      .eq('postal_code', cityInfo.postalCode)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error getting city ID:', error)
      return null
    }

    if (data && data.id) {
      // Sauvegarder l'ID dans le localStorage pour les prochaines fois
      saveCityInfo({
        ...cityInfo,
        id: data.id
      })
      return data.id
    }

    return null
  } catch (error) {
    console.error('Error getting city ID from database:', error)
    return null
  }
}

/**
 * Vérifie si les informations de la commune sont complètes
 * @returns {boolean} true si toutes les informations sont présentes, false sinon
 */
export const isCityInfoComplete = () => {
  const cityInfo = getCityInfo()
  if (!cityInfo) return false
  
  return !!(cityInfo.name && cityInfo.postalCode && cityInfo.email)
}

/**
 * Sauvegarde les informations de la commune dans le localStorage ET en base de données
 * @param {Object} cityData - Les données de la commune à sauvegarder
 * @returns {Promise<Object>} Les données sauvegardées ou null en cas d'erreur
 */
export const saveCityInfoToDatabase = async (cityData) => {
  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { supabase } = await import('@/services/supabase')
  
  try {
    const dataToSave = {
      name: cityData.name || '',
      postal_code: cityData.postalCode || '',
      email: cityData.email || ''
    }

    // Vérifier s'il existe déjà une entrée avec le même nom et code postal
    const { data: existingData } = await supabase
      .from('city_info')
      .select('id')
      .eq('name', dataToSave.name)
      .eq('postal_code', dataToSave.postal_code)
      .limit(1)
      .maybeSingle()

    let result

    if (existingData) {
      // Mettre à jour l'entrée existante
      const { data, error } = await supabase
        .from('city_info')
        .update(dataToSave)
        .eq('id', existingData.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Créer une nouvelle entrée
      const { data, error } = await supabase
        .from('city_info')
        .insert(dataToSave)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Sauvegarder aussi dans le localStorage avec l'ID
    saveCityInfo({
      ...cityData,
      id: result.id
    })

    return result
  } catch (error) {
    console.error('Error saving city info to database:', error)
    // En cas d'erreur de base de données, sauvegarder quand même dans le localStorage
    saveCityInfo(cityData)
    throw error
  }
}

/**
 * Récupère les informations de la commune depuis la base de données
 * @returns {Promise<Object|null>} Les données de la commune ou null si aucune donnée n'est trouvée
 */
export const getCityInfoFromDatabase = async () => {
  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { supabase } = await import('@/services/supabase')
  
  try {
    const { data, error } = await supabase
      .from('city_info')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      // Si aucune donnée n'existe, retourner null
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    if (!data) return null

    // Convertir les données de la base vers le format attendu
    const cityInfo = {
      name: data.name || '',
      postalCode: data.postal_code || '',
      email: data.email || '',
      id: data.id || null
    }

    // Synchroniser avec le localStorage (avec l'ID)
    saveCityInfo(cityInfo)

    return cityInfo
  } catch (error) {
    console.error('Error reading city info from database:', error)
    // En cas d'erreur, essayer de récupérer depuis le localStorage
    return getCityInfo()
  }
}

/**
 * Recherche des communes dans la base de données
 * @param {string} searchTerm - Terme de recherche (nom ou code postal)
 * @returns {Promise<Array>} Liste des communes correspondantes
 */
export const searchCitiesInDatabase = async (searchTerm) => {
  // Import dynamique pour éviter les problèmes de dépendances circulaires
  const { supabase } = await import('@/services/supabase')
  
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return []
    }

    const search = searchTerm.trim()
    
    // Recherche avec OR pour le nom ou le code postal
    // Syntaxe PostgREST : colonne.opérateur.valeur
    const { data, error } = await supabase
      .from('city_info')
      .select('id, name, postal_code, email')
      .or(`name.ilike.%${search}%,postal_code.ilike.%${search}%`)
      .limit(10)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error searching cities:', error)
      return []
    }

    return (data || []).map(city => ({
      id: city.id,
      name: city.name || '',
      postalCode: city.postal_code || '',
      email: city.email || ''
    }))
  } catch (error) {
    console.error('Error searching cities in database:', error)
    return []
  }
}

