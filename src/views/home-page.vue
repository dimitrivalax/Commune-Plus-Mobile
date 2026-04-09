<template>
  <IonPage>
    <AppHeader title="Accueil" :logo="true"></AppHeader>
    <IonContent :fullscreen="true">
      <div class="ion-padding">
        <div v-if="items.length > 0" class="cards-wrap">
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
  onIonViewWillEnter
} from '@ionic/vue'
import { informationCircle } from 'ionicons/icons'
import { ref } from 'vue'
import AppHeader from '@/components/app-header.vue'
import { InformationCommuneService } from '@/services/information-commune-service'
import { getCityInfo, getCityIdFromDatabase } from '@/utils/storage'

const items = ref([])

const getCommuneId = async () => {
  const cityInfo = getCityInfo()
  if (cityInfo?.id) return cityInfo.id
  return await getCityIdFromDatabase()
}

const loadHomeData = async () => {
  const communeId = await getCommuneId()
  const { data } = await InformationCommuneService.getAll(communeId)
  items.value = data || []
}

onIonViewWillEnter(async () => {
  await loadHomeData()
})
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
</style>
