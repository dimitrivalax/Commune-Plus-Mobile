export interface GeocodingFeature {
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: {
    label: string
    score: number
    housenumber?: string
    id: string
    name: string
    postcode: string
    citycode: string
    x: number
    y: number
    city: string
    context: string
    type: string
    importance: number
    street?: string
  }
}

export interface GeocodingResponse {
  type: string
  version: string
  features: GeocodingFeature[]
  attribution: string
  licence: string
  query: string
  limit: number
}

export function useGeocoding() {
  const getAddressFromCoordinates = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    if (!lat || !lon) return ''

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`
      )

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = (await response.json()) as GeocodingResponse

      if (data && data.features && data.features.length > 0) {
        // On privilégie le label complet fourni par l'API qui est bien formaté
        return data.features[0].properties.label
      }
    } catch (error) {
      console.error('Error getting address from coordinates:', error)
    }
    return ''
  }

  return {
    getAddressFromCoordinates
  }
}
