import { ref } from 'vue'

/** Incrémenter après mise à jour du localStorage commune pour rafraîchir les computed UI */
export const communeFeaturesVersion = ref(0)

export function bumpCommuneFeaturesVersion() {
  communeFeaturesVersion.value++
}
