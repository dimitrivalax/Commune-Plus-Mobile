<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Signalements</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Signalements</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="$router.push('/signalement/new')">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>

      <div class="ion-padding">
        <ion-refresher slot="fixed" @ionRefresh="loadSignalements($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <ion-list v-if="signalements.length > 0" class="signalements-list">
          <ion-item v-for="signalement in signalements" :key="signalement.id" class="signalement-item">
            <ion-thumbnail slot="start" v-if="signalement.photo_url">
              <img :src="signalement.photo_url" :alt="signalement.description" />
            </ion-thumbnail>
            <ion-label>
              <h2>{{ signalement.description || 'Sans description' }}</h2>
              <p v-if="signalement.comment" class="comment-text">{{ signalement.comment }}</p>
              <div class="item-meta">
                <span class="date-text">{{ formatDateTime(signalement.created_at) }}</span>
                <ion-badge :color="getStatusColor(signalement.status)" class="status-badge">
                  {{ signalement.status || 'En attente' }}
                </ion-badge>
              </div>
            </ion-label>
          </ion-item>
        </ion-list>

        <div v-else class="empty-state">
          <ion-icon :icon="documentText" class="empty-icon" />
          <h3>Aucun signalement</h3>
          <p>Aucun signalement pour le moment.</p>
          <ion-button expand="block" @click="$router.push('/signalement/new')" class="empty-action">
            Faire un signalement
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

const signalements = ref([])

const loadSignalements = async (event) => {
  try {
    const { data, error } = await supabase
      .from('signalements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    signalements.value = data || []
  } catch (error) {
    console.error('Error loading signalements:', error)
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
  loadSignalements()
})
</script>

<style scoped>
.signalements-list {
  background: transparent;
}

.signalement-item {
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

