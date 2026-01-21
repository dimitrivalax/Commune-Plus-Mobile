/**
 * Service de gestion du localStorage pour les coordonnées utilisateur
 */

const STORAGE_KEY = 'commune-plus-user-contact'

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

const CITY_STORAGE_KEY = 'commune-plus-city-info'

/**
 * Structure des données sauvegardées :
 * {
 *   name: string,
 *   postalCode: string,
 *   email: string,
 *   logo: string (optionnel)
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
      logo: cityData.logo || cityData.logo_url || null, // Support logo et logo_url
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
      logo: data.logo || null,
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
      .from('commune')
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
    // Nettoyer les données et s'assurer qu'on n'inclut pas l'id lors de l'insertion
    const dataToSave = {
      name: (cityData.name || '').trim(),
      postal_code: (cityData.postalCode || '').trim(),
      email: (cityData.email || '').trim(),
      logo_url: (cityData.logo || cityData.logo_url || '').trim() || null
    }

    // Valider que les champs requis ne sont pas vides
    if (!dataToSave.name || !dataToSave.postal_code || !dataToSave.email) {
      throw new Error('Tous les champs sont requis (nom, code postal, email)')
    }

    // Vérifier s'il existe déjà une entrée avec le même nom et code postal
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
      // Mettre à jour l'entrée existante
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
      // Créer une nouvelle entrée
      // S'assurer qu'on n'inclut pas l'id (il sera généré automatiquement)
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

    // Sauvegarder aussi dans le localStorage avec l'ID
    saveCityInfo({
      ...cityData,
      id: result.id
    })

    console.log('City info saved successfully to database:', result)
    return result
  } catch (error) {
    console.error('Error saving city info to database:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    // En cas d'erreur de base de données, sauvegarder quand même dans le localStorage
    saveCityInfo(cityData)
    // Propager l'erreur pour que l'appelant puisse la gérer
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
      .from('commune')
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
      logo: data.logo_url || null,
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
      .from('commune')
      .select('id, name, postal_code, email, logo_url')
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
      logo: city.logo_url || null
    }))
  } catch (error) {
    console.error('Error searching cities in database:', error)
    return []
  }
}
