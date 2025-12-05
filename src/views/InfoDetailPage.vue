<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/info"></ion-back-button>
        </ion-buttons>
        <ion-title>Détail</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding" v-if="infoItem">
        <h1>{{ infoItem.title }}</h1>
        <p class="meta-info">
          <ion-badge v-if="infoItem.category">{{ infoItem.category }}</ion-badge>
          <span>{{ formatDate(infoItem.created_at) }}</span>
        </p>
        <div v-html="infoItem.content"></div>
        <img v-if="infoItem.image_url" :src="infoItem.image_url" :alt="infoItem.title" class="info-image" />
      </div>
      <div v-else class="ion-padding">
        <p>Chargement...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonBadge } from '@ionic/vue'
import { supabase } from '@/services/supabase'
import { formatDate } from '@/utils/date'

const route = useRoute()
const infoItem = ref(null)

const loadInfoDetail = async () => {
  try {
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    infoItem.value = data
  } catch (error) {
    console.error('Error loading info detail:', error)
  }
}

onMounted(() => {
  loadInfoDetail()
})
</script>

<style scoped>
.meta-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ion-color-medium);
}

.info-image {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  margin-top: 16px;
}
</style>

