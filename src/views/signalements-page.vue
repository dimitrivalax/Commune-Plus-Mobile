<template>
  <IonPage>
    <AppHeader title="Signalements"></AppHeader>
    <IonContent class="page-content">
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton @click="$router.push('/signalement/new')">
          <IonIcon :icon="add" />
        </IonFabButton>
      </IonFab>

      <IonRefresher
        slot="fixed"
        @ionRefresh="loadSignalements($event)"
        class=""
      >
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
      <div class="ion-padding">
        <!-- Filtre par statut -->
        <IonItem class="filter-item" lines="none">
          <IonLabel>Filtrer par statut</IonLabel>
          <IonSelect
            v-model="selectedStatus"
            placeholder="Tous les statuts"
            interface="popover"
          >
            <IonSelectOption value="all">Tous</IonSelectOption>
            <IonSelectOption value="en_attente">En Attente</IonSelectOption>
            <IonSelectOption value="en_cours">En cours</IonSelectOption>
            <IonSelectOption value="traite">Traités</IonSelectOption>
            <IonSelectOption value="archive">Archivés</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonList
          v-if="filteredSignalements.length > 0"
          class="signalements-list"
        >
          <IonItem
            v-for="signalement in filteredSignalements"
            :key="signalement.id"
            class="signalement-item"
            button
            lines="none"
            @click="$router.push(`/signalement/${signalement.id}`)"
          >
            <template v-slot:start>
              <IonThumbnail v-if="signalement.photo_url">
                <img
                  :src="signalement.photo_url"
                  :alt="signalement.description"
                />
              </IonThumbnail>
            </template>
            <IonLabel>
              <h2>{{ signalement.description || 'Sans description' }}</h2>
              <p v-if="signalement.comment" class="comment-text">
                {{ signalement.comment }}
              </p>
              <div class="item-meta">
                <span class="date-text">{{
                  formatDateTime(signalement.created_at)
                }}</span>
                <IonBadge
                  :color="getStatusColor(signalement.status)"
                  class="status-badge"
                >
                  {{ getStatusLabel(signalement.status) }}
                </IonBadge>
              </div>
            </IonLabel>
          </IonItem>
        </IonList>

        <div v-else class="empty-state">
          <IonIcon :icon="bookOutline" class="empty-icon" />
          <h3>Aucun signalement</h3>
          <p v-if="selectedStatus === 'all'">
            Soyez le premier à faire un signalement pour votre commune !
          </p>
          <p v-else>Aucun signalement avec ce statut.</p>
          <IonButton
            v-if="selectedStatus === 'all'"
            expand="block"
            @click="$router.push('/signalement/new')"
            class="empty-action"
          >
            Créer un signalement
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  IonBadge,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  onIonViewWillEnter
} from '@ionic/vue'
import { add, bookOutline } from 'ionicons/icons'
import AppHeader from '@/components/app-header.vue'
import { SignalementService } from '@/services/signalement-service'
import { formatDateTime } from '@/utils/date'
import { useCommuneId } from '@/composables/useCommuneId'
import { getUserContact } from '@/utils/storage'

const signalements = ref([])
const selectedStatus = ref('all')
const { getCommuneId } = useCommuneId()

const filteredSignalements = computed(() => {
  if (selectedStatus.value === 'all') {
    return signalements.value
  }
  return signalements.value.filter((s) => s.status === selectedStatus.value)
})

const loadSignalements = async (event) => {
  try {
    const communeId = await getCommuneId()
    const contact = getUserContact()
    const userEmail = contact?.email?.trim()

    const { data, error } = await SignalementService.getMySignalementsInCommune(
      communeId,
      userEmail
    )

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

onIonViewWillEnter(() => {
  loadSignalements()
})

const getStatusColor = (status) => {
  switch (status) {
    case 'traite':
      return 'success'
    case 'en_cours':
      return 'warning'
    case 'archive':
      return 'medium'
    case 'en_attente':
    default:
      return 'medium'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'traite':
      return 'Traité'
    case 'en_cours':
      return 'En cours'
    case 'archive':
      return 'Archivé'
    case 'en_attente':
    default:
      return 'En Attente'
  }
}

onMounted(() => {
  loadSignalements()
})
</script>

<style lang="scss" scoped>
.filter-item {
  margin-bottom: 16px;
  --background: var(--ion-color-light);
  border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.signalements-list {
  background: transparent;
}

.signalement-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  color: var(--ion-color-dark);

  ion-thumbnail {
    --size: 80px;
    --border-radius: 8px;
  }
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

.empty-icon {
  font-size: 64px;
  color: var(--ion-color-light);
  margin-bottom: 16px;
}

.empty-action {
  max-width: 300px;
  margin: 0 auto;
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
