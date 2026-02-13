/**
 * Service d'envoi d'email via Supabase Edge Function
 */

import { supabase } from './supabase'
import { getAddressFromCoordinates } from '@/utils/geocoding'

/**
 * Envoie un email de signalement à la mairie
 * @param {Object} signalementData - Les données du signalement
 * @param {string} signalementData.firstName - Prénom de l'utilisateur
 * @param {string} signalementData.lastName - Nom de l'utilisateur
 * @param {string} signalementData.email - Email de l'utilisateur
 * @param {string} signalementData.commune - Nom de la commune
 * @param {string} signalementData.description - Description du signalement
 * @param {string} signalementData.photoUrl - URL de la photo du signalement
 * @param {string} signalementData.mairieEmail - Email de la mairie destinataire
 * @param {string} [signalementData.address] - Adresse du signalement (optionnel)
 * @param {number} [signalementData.latitude] - Latitude pour reverse geocoding si pas d'adresse
 * @param {number} [signalementData.longitude] - Longitude pour reverse geocoding si pas d'adresse
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export const sendSignalementEmail = async (signalementData) => {
  try {
    let address = signalementData.address?.trim() || ''
    if (
      !address &&
      signalementData.latitude != null &&
      signalementData.longitude != null
    ) {
      address = await getAddressFromCoordinates(
        signalementData.latitude,
        signalementData.longitude
      )
    }

    const { data, error } = await supabase.functions.invoke(
      'send-signalement-email',
      {
        body: {
          firstName: signalementData.firstName,
          lastName: signalementData.lastName,
          email: signalementData.email,
          commune: signalementData.commune,
          description: signalementData.description,
          photoUrl: signalementData.photoUrl,
          address: address || null,
          mairieEmail: signalementData.mairieEmail
        }
      }
    )

    if (error) {
      console.error('Error calling email function:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending signalement email:', error)
    throw error
  }
}
