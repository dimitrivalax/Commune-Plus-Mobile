import { computed } from 'vue'
import { getCityInfo } from '@/utils/storage'
import { communeFeaturesVersion } from '@/utils/commune-features-version'

/**
 * Flags d'affichage réservations / propositions (défaut true si non présents).
 */
export function useCommuneFeatures() {
  const isReservationsEnabled = computed(() => {
    communeFeaturesVersion.value
    const c = getCityInfo()
    return !c || c.feature_reservations_salles !== false
  })

  const isPropositionsEnabled = computed(() => {
    communeFeaturesVersion.value
    const c = getCityInfo()
    return !c || c.feature_propositions !== false
  })

  return { isReservationsEnabled, isPropositionsEnabled }
}
