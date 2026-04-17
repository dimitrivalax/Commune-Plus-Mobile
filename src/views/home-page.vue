<template>
  <IonPage>
    <AppHeader title="Accueil" :logo="true"></AppHeader>
    <IonContent class="page-content">
      <div class="ion-padding">
        <div v-if="isLoading" class="empty-state">
          <IonSpinner name="crescent" />
          <p>Chargement des informations...</p>
        </div>
        <div v-else-if="errorMessage" class="empty-state">
          <IonIcon :icon="informationCircle" class="empty-icon" />
          <h3>Impossible de charger les informations</h3>
          <p>{{ errorMessage }}</p>
        </div>
        <div v-else-if="items.length > 0" class="cards-wrap">
          <IonCard v-for="item in items" :key="item.id" class="info-card">
            <img
              v-if="item.photo_url"
              :src="item.photo_url"
              :alt="item.title"
              class="info-image"
            />
            <IonCardHeader>
              <IonCardTitle>{{ item.title }}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div class="info-description" v-html="item.description"></div>
            </IonCardContent>
          </IonCard>
        </div>
        <div v-else class="empty-state">
          <IonIcon :icon="informationCircle" class="empty-icon" />
          <h3>Aucune information communale</h3>
          <p>Les informations de votre commune apparaîtront ici.</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import { informationCircle } from 'ionicons/icons'
import { ref, watch } from 'vue'
import AppHeader from '@/components/app-header.vue'
import { InformationCommuneService } from '@/services/information-commune-service'
import { useCommuneId } from '@/composables/useCommuneId'
import { communeFeaturesVersion } from '@/utils/commune-features-version'
import { getErrorMessage } from '@/utils/error-message'

const items = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const { getCommuneId } = useCommuneId()

const loadHomeData = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''
  const communeId = await getCommuneId()
  if (!communeId) {
    items.value = []
    errorMessage.value = 'Aucune commune n’est configurée pour le moment.'
    isLoading.value = false
    return
  }

  try {
    const { data, error } = await InformationCommuneService.getAll(communeId)
    if (error) {
      throw error
    }
    items.value = data || []
  } catch (error) {
    console.error('Error loading home data:', error)
    items.value = []
    errorMessage.value = getErrorMessage(
      error,
      'Veuillez réessayer dans quelques instants.'
    )
  } finally {
    isLoading.value = false
  }
}

onIonViewWillEnter(async () => {
  await loadHomeData()
})

watch(
  () => communeFeaturesVersion.value,
  async () => {
    await loadHomeData()
  }
)
</script>

<style lang="scss" scoped>
.cards-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  margin: 0;
}

.info-image {
  display: block;
  width: 100%;
  max-height: 210px;
  object-fit: cover;
}

.info-description {
  line-height: 1.5;
  color: var(--ion-color-medium-shade);

  :deep(p) {
    margin: 0 0 10px 0;
  }

  :deep(p:last-child) {
    margin-bottom: 0;
  }

  :deep(strong) {
    color: var(--ion-color-dark);
    font-weight: 600;
  }
}

.empty-state {
  text-align: center;
  padding: 48px 24px;

  .empty-icon {
    font-size: 64px;
    color: var(--ion-color-light);
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px 0;
  }

  p {
    margin: 0;
    color: var(--ion-color-medium);
  }
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
