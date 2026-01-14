<template>
  <IonPage @ionViewWillEnter="loadReservations">
    <AppHeader title="Réservations"></AppHeader>
    <IonContent :fullscreen="true">
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton @click="$router.push('/reservation/new')">
          <IonIcon :icon="add" />
        </IonFabButton>
      </IonFab>

      <div class="ion-padding">
        <IonRefresher slot="fixed" @ionRefresh="loadReservations($event)">
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonList v-if="reservations.length > 0" class="reservations-list">
          <IonItem
            v-for="reservation in reservations"
            :key="reservation.id"
            class="reservation-item"
            button
            @click="$router.push(`/reservation/${reservation.id}`)"
          >
            <IonIcon :icon="calendar" slot="start" class="reservation-icon" />
            <IonLabel>
              <h2>{{ reservation.salle_nom || reservation.salle?.nom || 'Salle inconnue' }}</h2>
              <div class="item-meta">
                <span class="date-text">{{
                  formatDate(reservation.date)
                }}</span>
                <span class="time-text"
                  >{{ formatTime(reservation.start_time) }} -
                  {{ formatTime(reservation.end_time) }}</span
                >
              </div>
              <IonBadge
                :color="getStatusColor(reservation.status)"
                class="status-badge"
              >
                {{ getStatusLabel(reservation.status) }}
              </IonBadge>
            </IonLabel>
          </IonItem>
        </IonList>

        <div v-else class="empty-state">
          <IonIcon :icon="calendarOutline" class="empty-icon" />
          <h3>Aucune réservation</h3>
          <p>Aucune réservation pour le moment.</p>
          <IonButton
            expand="block"
            @click="$router.push('/reservation/new')"
            class="empty-action"
          >
            Réserver une salle
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue'
import { add, calendar, calendarOutline } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import AppHeader from '@/components/AppHeader.vue'
import { formatDate, formatTime } from '@/utils/date'

const reservations = ref([])

const loadReservations = async (event) => {
  try {
    const { data, error } = await supabase
      .from('reservations_salles')
      .select(`
        *,
        salle:salles(id, nom)
      `)
      .order('date', { ascending: false })

    if (error) throw error

    // Extraire le nom de la salle pour chaque réservation
    reservations.value = (data || []).map(reservation => ({
      ...reservation,
      salle_nom: reservation.salle?.nom || 'Salle inconnue'
    }))
  } catch (error) {
    console.error('Error loading reservations:', error)
  } finally {
    if (event) {
      event.target.complete()
    }
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmée':
      return 'success'
    case 'refusée':
      return 'danger'
    case 'en_attente':
    default:
      return 'warning'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'confirmée':
      return 'Confirmée'
    case 'refusée':
      return 'Refusée'
    case 'en_attente':
    default:
      return 'En attente'
  }
}

onMounted(() => {
  loadReservations()
})

// Recharger les réservations quand la page devient active (après création/suppression)
onActivated(() => {
  loadReservations()
})
</script>

<style scoped>
.reservations-list {
  background: transparent;
}

.reservation-item {
  --background: white;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.reservation-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
  margin-right: 12px;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.date-text {
  font-size: 14px;
  color: var(--ion-color-dark);
  font-weight: 500;
}

.time-text {
  font-size: 13px;
  color: var(--ion-color-medium);
}

.status-badge {
  margin-top: 8px;
  display: inline-block;
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
  margin-bottom: 24px;
}

.empty-action {
  max-width: 300px;
  margin: 0 auto;
}
</style>
