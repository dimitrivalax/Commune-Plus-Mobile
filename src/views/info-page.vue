<template>
  <IonPage>
    <AppHeader title="Informations"></AppHeader>
    <IonContent :fullscreen="true">
      <div class="ion-padding">
        <IonRefresher slot="fixed" @ionRefresh="loadInfo($event)">
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonList v-if="infoItems.length > 0" class="info-list">
          <IonItem
            lines="none"
            v-for="item in infoItems"
            :key="item.id"
            button
            @click="$router.push(`/info/${item.id}`)"
            class="info-item"
          >
            <IonIcon :icon="newspaper" slot="start" class="info-icon" />
            <IonLabel>
              <h2>{{ item.title }}</h2>
              <div class="item-meta">
                <span class="date-text">{{ formatDate(item.created_at) }}</span>
                <IonBadge v-if="item.category" class="category-badge">
                  {{ item.category }}
                </IonBadge>
              </div>
            </IonLabel>
            <IonIcon :icon="chevronForward" slot="end" class="chevron-icon" />
          </IonItem>
        </IonList>

        <div v-else class="empty-state">
          <IonIcon :icon="newspaperOutline" class="empty-icon" />
          <h3>Aucune information</h3>
          <p>Aucune information disponible pour le moment.</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue'
import { newspaper, newspaperOutline, chevronForward } from 'ionicons/icons'
import AppHeader from '@/components/app-header.vue'
import { InformationService } from '@/services/information-service'
import { formatDate } from '@/utils/date'

const infoItems = ref([])

const loadInfo = async (event) => {
  try {
    const { data, error } = await InformationService.getAll()

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

<style lang="scss" scoped>
.info-list {
  background: transparent;
}

.info-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  .info-icon {
    font-size: 24px;
    color: var(--ion-color-primary);
    margin-right: 12px;
  }

  .chevron-icon {
    font-size: 20px;
    color: var(--ion-color-medium);
  }
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

  .empty-icon {
    font-size: 64px;
    color: var(--ion-color-light);
    margin-bottom: 16px;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--ion-color-light);
    margin: 0 0 8px 0;
  }

  p {
    color: var(--ion-color-medium);
  }
}
</style>
