/**
 * Envoi d'e-mail signalement via l'API BackOffice (Resend côté serveur).
 */

import { getAddressFromCoordinates } from '@/utils/geocoding'
import { normalizeServiceError } from '@/utils/service-error'

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

    const apiUrl = import.meta.env.VITE_BACKOFFICE_API_URL
    if (!apiUrl) {
      throw new Error('VITE_BACKOFFICE_API_URL is not configured')
    }

    const res = await fetch(`${apiUrl}/api/public/signalement-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: signalementData.firstName,
        lastName: signalementData.lastName,
        email: signalementData.email,
        commune: signalementData.commune,
        description: signalementData.description,
        photoUrl: signalementData.photoUrl,
        address: address || null,
        mairieEmail: signalementData.mairieEmail
      })
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg =
        data.message || data.error || res.statusText || 'Échec envoi e-mail'
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }

    return data
  } catch (error) {
    const normalizedError = normalizeServiceError(
      error,
      "Erreur lors de l'envoi de l'email"
    )
    console.error('Error sending signalement email:', normalizedError)
    throw new Error(normalizedError.message)
  }
}
