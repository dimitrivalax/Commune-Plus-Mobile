<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Informations</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$router.push('/settings')">
            <ion-icon :icon="settings" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title size="large">Informations</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-refresher slot="fixed" @ionRefresh="loadInfo($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <ion-list v-if="infoItems.length > 0" class="info-list">
          <ion-item
            v-for="item in infoItems"
            :key="item.id"
            button
            @click="$router.push(`/info/${item.id}`)"
            class="info-item"
          >
            <ion-icon :icon="newspaper" slot="start" class="info-icon" />
            <ion-label>
              <h2>{{ item.title }}</h2>
              <div class="item-meta">
                <span class="date-text">{{ formatDate(item.created_at) }}</span>
                <ion-badge v-if="item.category" class="category-badge">
                  {{ item.category }}
                </ion-badge>
              </div>
            </ion-label>
            <ion-icon :icon="chevronForward" slot="end" class="chevron-icon" />
          </ion-item>
        </ion-list>

        <div v-else class="empty-state">
          <ion-icon :icon="newspaperOutline" class="empty-icon" />
          <h3>Aucune information</h3>
          <p>Aucune information disponible pour le moment.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonRefresher, IonRefresherContent, IonButtons, IonButton } from '@ionic/vue'
import { newspaper, newspaperOutline, chevronForward, settings } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { formatDate } from '@/utils/date'

const infoItems = ref([])

const loadInfo = async (event) => {
  try {
    const { data, error } = await supabase
      .from('municipal_info')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    infoItems.value = data || []
  } catch (error) {
    console.error('Error loading info:', error)
  } finally {
    if (event) {
      event.target.complete()
    }
  }
}

onMounted(() => {
  loadInfo()
})
</script>

<style scoped>
.info-list {
  background: transparent;
}

.info-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.info-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
  margin-right: 12px;
}

.chevron-icon {
  font-size: 20px;
  color: var(--ion-color-medium);
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

.category-badge {
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
  color: var(--ion-color-light);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--ion-color-medium);
}
</style>

