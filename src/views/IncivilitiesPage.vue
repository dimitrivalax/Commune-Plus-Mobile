<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Incivilités</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Incivilités</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="$router.push('/incivility/new')">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <div class="ion-padding">
        <ion-refresher slot="fixed" @ionRefresh="loadIncivilities($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <ion-list v-if="incivilities.length > 0" class="incivilities-list">
          <ion-item v-for="incivility in incivilities" :key="incivility.id" class="incivility-item">
            <ion-thumbnail slot="start" v-if="incivility.photo_url">
              <img :src="incivility.photo_url" :alt="incivility.description" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ incivility.description || 'Sans description' }}</h2>
              <p v-if="incivility.comment" class="comment-text">{{ incivility.comment }}</p>
              <div class="item-meta">
                <span class="date-text">{{ formatDateTime(incivility.created_at) }}</span>
                <ion-badge :color="getStatusColor(incivility.status)" class="status-badge">
                  {{ incivility.status || 'En attente' }}
                </ion-badge>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>

        <div v-else class="empty-state">
          <ion-icon :icon="documentText" class="empty-icon" />
          <h3>Aucune incivilité</h3>
          <p>Aucune incivilité signalée pour le moment.</p>
          <ion-button expand="block" @click="$router.push('/incivility/new')" class="empty-action">
            Signaler une incivilité
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonList, IonItem, IonLabel, IonThumbnail, IonBadge, IonCard, IonCardContent, IonButton, IonRefresher, IonRefresherContent } from '@ionic/vue'
import { add, documentText } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { formatDateTime } from '@/utils/date'

const incivilities = ref([])

const loadIncivilities = async (event) => {
  try {
    const { data, error } = await supabase
      .from('incivilities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    incivilities.value = data || []
  } catch (error) {
    console.error('Error loading incivilities:', error)
  } finally {
    if (event) {
      event.target.complete()
    }
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'traité':
      return 'success'
    case 'en_cours':
      return 'warning'
    case 'en_attente':
    default:
      return 'medium'
  }
}

onMounted(() => {
  loadIncivilities()
})
</script>

<style scoped>
.incivilities-list {
  background: transparent;
}

.incivility-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

ion-thumbnail {
  --size: 80px;
  --border-radius: 8px;
}

.comment-text {
  font-style: italic;
  color: var(--ion-color-medium);
  margin-top: 4px;
  font-size: 13px;
}

.item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.date-text {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.status-badge {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-light);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 24px;
}

.empty-action {
  max-width: 300px;
  margin: 0 auto;
}
</style>

