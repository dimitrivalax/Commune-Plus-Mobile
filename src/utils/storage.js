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

