import { getAddressFromCoordinates } from '@/utils/geocoding'

// Réexport des types pour compatibilité
export type { GeocodingFeature, GeocodingResponse } from '@/utils/geocoding'

export function useGeocoding() {
  return {
    getAddressFromCoordinates
  }
}
