<template>
  <div class="city-typeahead">
    <ion-item lines="none">
      <ion-label position="stacked">
        Rechercher une commune existante
      </ion-label>
      <ion-input
        class="custom"
        shape="round"
        mode="ios"
        fill="outline"
        v-model="searchTerm"
        type="text"
        placeholder="Tapez le nom ou le code postal..."
        @ion-input="handleSearch"
        @ion-focus="showDropdown = true"
        @ion-blur="handleBlur"
        :disabled="disabled"
      >
        <template v-slot:end>
          <ion-icon
            v-if="isSearching"
            :icon="hourglassOutline"
            class="search-icon"
          ></ion-icon>
          <ion-icon
            v-else-if="searchTerm && !isSearching"
            :icon="searchOutline"
            class="search-icon"
          ></ion-icon>
        </template>
      </ion-input>
    </ion-item>

    <!-- Dropdown avec les résultats -->
    <div
      v-if="
        showDropdown && (filteredCities.length > 0 || searchTerm.length >= 2)
      "
      class="dropdown"
    >
      <div v-if="isSearching" class="dropdown-item loading">
        <ion-spinner name="crescent" size="small"></ion-spinner>
        <span>Recherche en cours...</span>
      </div>

      <div
        v-else-if="filteredCities.length === 0 && searchTerm.length >= 2"
        class="dropdown-item no-results"
      >
        Aucune commune trouvée
      </div>

      <div
        v-for="city in filteredCities"
        :key="city.id"
        class="dropdown-item"
        @click="selectCity(city)"
      >
        <div class="city-name">{{ city.name }}</div>
        <div class="city-details">
          <span class="postal-code">{{ city.postalCode }}</span>
          <span class="separator">•</span>
          <span class="email">{{ city.email }}</span>
          <img v-if="city.logo" :src="city.logo" alt="Logo" class="city-logo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonItem, IonLabel, IonInput, IonIcon, IonSpinner } from '@ionic/vue'
import { searchOutline, hourglassOutline } from 'ionicons/icons'
import { searchCitiesInDatabase } from '@/utils/storage'

defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const searchTerm = ref('')
const filteredCities = ref([])
const showDropdown = ref(false)
const isSearching = ref(false)
const searchTimeout = ref(null)

const handleSearch = async (event) => {
  const value = event.detail.value || ''
  searchTerm.value = value

  // Annuler la recherche précédente
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (value.length < 2) {
    filteredCities.value = []
    showDropdown.value = false
    return
  }

  // Debounce de 300ms
  searchTimeout.value = setTimeout(async () => {
    isSearching.value = true
    showDropdown.value = true

    try {
      const results = await searchCitiesInDatabase(value)
      filteredCities.value = results
    } catch (error) {
      console.error('Error searching cities:', error)
      filteredCities.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const selectCity = (city) => {
  searchTerm.value = `${city.name} (${city.postalCode})`
  filteredCities.value = []
  showDropdown.value = false
  emit('select', city)
}

const handleBlur = () => {
  // Délai pour permettre le clic sur un élément de la liste
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

// Réinitialiser quand le composant est monté
onMounted(() => {
  searchTerm.value = ''
  filteredCities.value = []
})
</script>

<style lang="scss" scoped>
.city-typeahead {
  position: relative;
  margin-bottom: 16px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.search-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid var(--ion-color-light);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--ion-color-light);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--ion-color-medium);
    border-radius: 3px;

    &:hover {
      background: var(--ion-color-medium-shade);
    }
  }
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--ion-color-light);
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--ion-color-light);
  }

  &.loading,
  &.no-results {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--ion-color-medium);
    font-style: italic;
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }
}

.city-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.city-details {
  font-size: 13px;
  color: var(--ion-color-medium);
  display: flex;
  align-items: center;
  gap: 8px;
}

.postal-code {
  font-weight: 500;
  color: var(--ion-color-primary);
}

.separator {
  color: var(--ion-color-light-shade);
}

.email {
  font-size: 12px;
}

.city-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background: white;
  border-radius: 24px;
  margin: 4px;
}
</style>
