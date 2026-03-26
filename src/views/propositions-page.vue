<template>
  <IonPage>
    <AppHeader title="Cahier de Propositions"></AppHeader>
    <IonContent :fullscreen="true">
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton @click="$router.push('/proposition/new')">
          <IonIcon :icon="add" />
        </IonFabButton>
      </IonFab>

      <IonRefresher slot="fixed" @ionRefresh="loadPropositions($event)">
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <div class="ion-padding">
        <!-- Sort Segment -->
        <IonItem class="filter-item" lines="none">
          <IonLabel>Trier par</IonLabel>
          <IonSelect
            v-model="sortBy"
            interface="popover"
            @ionChange="handleSortChange"
          >
            <IonSelectOption value="updated_at"
              >Date de modification</IonSelectOption
            >
            <IonSelectOption value="votes_count"
              >Nombre de votes</IonSelectOption
            >
          </IonSelect>
        </IonItem>

        <IonList v-if="propositions.length > 0" class="propositions-list">
          <IonItem
            v-for="proposition in propositions"
            :key="proposition.id"
            class="proposition-item"
            button
            lines="none"
            @click="$router.push(`/proposition/${proposition.id}`)"
          >
            <IonThumbnail v-if="proposition.photo_url" slot="start">
              <img :src="proposition.photo_url" :alt="proposition.name" />
            </IonThumbnail>
            <IonLabel>
              <div class="proposition-header">
                <h2>{{ proposition.name }}</h2>
                <div class="vote-badge">
                  <IonIcon :icon="thumbsUp" />
                  <span>{{ proposition.votes_count || 0 }}</span>
                </div>
              </div>
              <p class="description-snippet">
                {{ truncateText(proposition.description, 100) }}
              </p>
              <div class="item-meta">
                <span class="user-text"
                  >{{ proposition.user_firstname }}
                  {{ proposition.user_lastname }}</span
                >
                <span class="date-text">{{
                  formatDateTime(proposition.updated_at)
                }}</span>
              </div>
            </IonLabel>
          </IonItem>
        </IonList>

        <div v-else-if="!loading" class="empty-state">
          <IonIcon :icon="bookOutline" class="empty-icon" />
          <h3>Aucune proposition</h3>
          <p>Soyez le premier à proposer une idée pour votre commune !</p>
          <IonButton
            expand="block"
            @click="$router.push('/proposition/new')"
            class="empty-action"
          >
            Créer une proposition
          </IonButton>
        </div>

        <div v-if="loading" class="loading-state">
          <IonSpinner name="crescent" />
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
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  onIonViewWillEnter
} from '@ionic/vue'
import { add, bookOutline, thumbsUp } from 'ionicons/icons'
import AppHeader from '@/components/app-header.vue'
import { PropositionService } from '@/services/proposition-service'
import { formatDateTime } from '@/utils/date'
import { getCityIdFromDatabase } from '@/utils/storage'

const propositions = ref([])
const sortBy = ref('updated_at')
const loading = ref(true)

const loadPropositions = async (event) => {
  try {
    // Only show global spinner on initial load, use refresher for others
    if (!event && propositions.value.length === 0) {
      loading.value = true
    }
    const communeId = await getCityIdFromDatabase()
    if (!communeId) {
      propositions.value = []
      return
    }

    const { data, error } = await PropositionService.getAll(
      communeId,
      sortBy.value
    )

    if (error) throw error
    propositions.value = data || []
  } catch (error) {
    console.error('Error loading propositions:', error)
  } finally {
    loading.value = false
    if (event) {
      event.target.complete()
    }
  }
}

const handleSortChange = () => {
  loadPropositions()
}

onIonViewWillEnter(() => {
  loadPropositions()
})

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// onMounted removed in favor of onIonViewWillEnter for consistent refreshing
</script>

<style lang="scss" scoped>
.filter-item {
  margin-bottom: 16px;
  --background: var(--ion-color-light);
  border-radius: 8px;
}

.propositions-list {
  background: transparent;
}

.proposition-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  ion-thumbnail {
    --size: 70px;
    --border-radius: 8px;
    margin-right: 12px;

    img {
      object-fit: cover;
    }
  }
}

.proposition-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;

  h2 {
    font-weight: 600;
    margin: 0;
    color: var(--ion-color-dark);
    font-size: 16px;
    flex: 1;
    margin-right: 8px;
  }
}

.vote-badge {
  display: flex;
  align-items: center;
  background: var(--ion-color-primary-light, #e8f0fe);
  color: var(--ion-color-primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  ion-icon {
    font-size: 14px;
    margin-right: 4px;
  }
}

.description-snippet {
  color: var(--ion-color-step-600);
  font-size: 14px;
  margin: 4px 0;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--ion-color-medium);
}

.user-text {
  font-weight: 500;
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
    margin-bottom: 24px;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
