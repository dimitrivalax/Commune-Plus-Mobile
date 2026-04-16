<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/tabs/reservations"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Nouvelle réservation</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="contentRef" class="page-content">
      <div class="ion-padding">
        <div class="salles-section">
          <ion-label class="salles-label">Salle</ion-label>
          <p class="salles-helper">
            Sélectionnez une salle. Cliquez à nouveau sur la carte pour la
            désélectionner.
          </p>

          <div v-if="salles.length === 0" class="empty-salles">
            Aucune salle disponible
          </div>

          <div v-else class="salles-grid">
            <ion-card
              v-for="salle in salles"
              :key="salle.id"
              button
              class="salle-card"
              :class="{ selected: newForm.salleId === salle.id }"
              @click="toggleSalleSelection(salle.id)"
            >
              <img
                v-if="getSallePhotoUrl(salle)"
                :src="getSallePhotoUrl(salle)"
                :alt="`Photo de ${salle.nom}`"
                class="salle-card-image"
              />
              <ion-card-header>
                <ion-card-title>{{ salle.nom }}</ion-card-title>
                <ion-card-subtitle v-if="salle.nombre_max_places">
                  {{ salle.nombre_max_places }} places max
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <p v-if="salle.description" class="salle-card-description">
                  {{ salle.description }}
                </p>
                <p v-if="salle.adresse" class="salle-card-address">
                  {{ salle.adresse }}
                </p>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <div
          v-if="newForm.salleId"
          class="calendar-container"
          ref="availabilitySectionRef"
        >
          <h2 class="section-title">Disponibilités</h2>
          <ion-datetime
            presentation="date"
            class="custom-calendar"
            :highlighted-dates="highlightedDates"
            :value="newForm.date"
            @ionChange="handleDateChange"
          ></ion-datetime>

          <div class="day-planning">
            <h3 class="planning-title">
              Occupations le {{ selectedDayFormatted }}
            </h3>
            <div v-if="dayReservations.length === 0" class="no-reservations">
              Aucune occupation ce jour
            </div>
            <div v-else class="reservations-list">
              <div
                v-for="res in dayReservations"
                :key="res.id"
                class="reservation-item"
              >
                <div class="res-info">
                  <span class="time-slot"
                    >{{ res.start_time.substring(0, 5) }} -
                    {{ res.end_time.substring(0, 5) }}</span
                  >
                  <p class="res-reason" v-if="res.reason">{{ res.reason }}</p>
                </div>
                <span class="res-status" :class="res.status">{{
                  res.status === 'en_attente' ? 'En attente' : 'Confirmé'
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="newForm.salleId" class="time-selection-container">
          <h2 class="section-title">Votre créneau</h2>
          <ion-item lines="none">
            <ion-label>Heure de début</ion-label>
            <ion-datetime-button datetime="start-time"></ion-datetime-button>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime
                id="start-time"
                :show-default-buttons="true"
                presentation="time"
                :value="newForm.startTime"
                @ionChange="handleStartTimeChange"
              ></ion-datetime>
            </ion-modal>
          </ion-item>

          <ion-item lines="none">
            <ion-label>Heure de fin</ion-label>
            <ion-datetime-button datetime="end-time"></ion-datetime-button>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime
                id="end-time"
                :show-default-buttons="true"
                presentation="time"
                :value="newForm.endTime"
                @ionChange="
                  (event) => {
                    newForm.endTime = event.detail.value
                    validateTimeRange()
                  }
                "
              ></ion-datetime>
            </ion-modal>
          </ion-item>

          <div v-if="conflictMessage" class="conflict-alert">
            <ion-icon :icon="alertCircleOutline" />
            {{ conflictMessage }}
          </div>
        </div>

        <div class="contact-information">
          <h2 class="section-title">Vos coordonnées</h2>
          <p v-if="hasSavedContact" class="saved-contact-info">
            <ion-icon :icon="checkmarkCircleOutline" />
            Pré-remplies depuis votre profil
          </p>

          <ion-item lines="none">
            <ion-label position="stacked">Prénom *</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="newForm.firstName"
              placeholder="Votre prénom"
              required
            ></ion-input>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Nom *</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="newForm.lastName"
              placeholder="Votre nom"
              required
            ></ion-input>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Email *</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="newForm.email"
              type="email"
              placeholder="Votre email"
              required
            ></ion-input>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Téléphone *</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="newForm.phone"
              type="tel"
              placeholder="Votre téléphone"
              required
            ></ion-input>
          </ion-item>
        </div>

        <ion-item lines="none" class="reason-item">
          <ion-label position="stacked"
            >Raison de la réservation (obligatoire)</ion-label
          >
          <ion-textarea
            shape="round"
            mode="ios"
            fill="outline"
            class="custom"
            v-model="newForm.reason"
            placeholder="Événement, réunion, etc..."
            rows="4"
          ></ion-textarea>
        </ion-item>

        <ion-button
          expand="block"
          class="submit-button"
          @click="submitReservation"
          :disabled="loading || !isFormValid || !!conflictMessage"
        >
          <template v-slot:start>
            <ion-icon :icon="checkmark" />
          </template>
          Envoyer la demande
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonTextarea,
  IonInput,
  IonButton,
  IonIcon,
  loadingController,
  toastController
} from '@ionic/vue'
import {
  checkmark,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { ReservationService } from '@/services/reservation-service'
import { formatDate, formatDateForDB, formatTime } from '@/utils/date'
import { saveUserContact, getUserContact, getCityInfo } from '@/utils/storage'
import { updatePushTokenEmail } from '@/services/push-notifications'

const router = useRouter()

const newForm = ref({
  salleId: '',
  date: new Date().toISOString(),
  startTime: '10:00',
  endTime: '12:00',
  reason: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

const loading = ref(false)
const hasSavedContact = ref(false)
const salles = ref([])
const reservations = ref([])
const conflictMessage = ref('')
const contentRef = ref(null)
const availabilitySectionRef = ref(null)

// On formattage du jour sélectionné pour l'affichage
const selectedDayFormatted = computed(() => {
  return formatDate(newForm.value.date)
})

// Filtrer les réservations pour le jour sélectionné
const dayReservations = computed(() => {
  const selectedDate = formatDateForDB(newForm.value.date)
  return reservations.value.filter((res) => res.date === selectedDate)
})

// Dates à mettre en évidence sur le calendrier
const highlightedDates = computed(() => {
  const dates = [...new Set(reservations.value.map((res) => res.date))]
  return dates.map((date) => ({
    date,
    textColor: '#ffffff',
    backgroundColor: 'var(--ion-color-secondary)'
  }))
})

const getSallePhotoUrl = (salle) => {
  return (
    salle?.photo_url ||
    salle?.photoUrl ||
    salle?.image_url ||
    salle?.imageUrl ||
    null
  )
}

const isFormValid = computed(() => {
  return (
    newForm.value.salleId &&
    newForm.value.date &&
    newForm.value.startTime &&
    newForm.value.endTime &&
    newForm.value.firstName.trim() &&
    newForm.value.lastName.trim() &&
    newForm.value.email.trim() &&
    newForm.value.phone.trim() &&
    newForm.value.reason.trim() !== ''
  )
})

// Charger les réservations pour la salle sélectionnée
const fetchReservations = async (salleId) => {
  if (!salleId) {
    reservations.value = []
    return
  }
  try {
    const { data, error } =
      await ReservationService.getReservationsBySalle(salleId)
    if (error) throw error
    reservations.value = data || []
    validateTimeRange() // Re-vérifier les conflits si on change de salle
  } catch (error) {
    console.error('Error fetching reservations:', error)
  }
}

const scrollToAvailabilitySection = async () => {
  await nextTick()

  const targetEl = availabilitySectionRef.value
  const ionContentEl = contentRef.value?.$el || contentRef.value

  if (
    !targetEl ||
    !ionContentEl?.getScrollElement ||
    !ionContentEl?.scrollToPoint
  ) {
    targetEl?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
    return
  }

  const scrollEl = await ionContentEl.getScrollElement()
  const targetTop =
    targetEl.getBoundingClientRect().top -
    scrollEl.getBoundingClientRect().top +
    scrollEl.scrollTop

  const extraTopOffset = 140
  const y = Math.max(targetTop - extraTopOffset, 0)
  await ionContentEl.scrollToPoint(0, y, 350)
}

const toggleSalleSelection = (salleId) => {
  if (newForm.value.salleId === salleId) {
    newForm.value.salleId = ''
    reservations.value = []
    conflictMessage.value = ''
    return
  }

  newForm.value.salleId = salleId
  fetchReservations(salleId)
  scrollToAvailabilitySection()
}

const handleDateChange = (event) => {
  newForm.value.date = event.detail.value
  validateTimeRange()
}

/** Retourne l'heure de fin = heure de début + 1h (même format que la valeur reçue) */
const getEndTimeOneHourAfter = (startTimeValue) => {
  const dateStr = formatDateForDB(newForm.value.date)
  const timeStr = formatTime(startTimeValue)
  const d = new Date(dateStr + 'T' + timeStr + ':00')
  d.setHours(d.getHours() + 3)
  return d.toISOString()
}

const handleStartTimeChange = (event) => {
  const value = event.detail.value
  newForm.value.startTime = value
  newForm.value.endTime = getEndTimeOneHourAfter(value)
  validateTimeRange()
}

// Vérifier les conflits de créneaux
const validateTimeRange = () => {
  conflictMessage.value = ''

  if (
    !newForm.value.startTime ||
    !newForm.value.endTime ||
    !newForm.value.date ||
    !newForm.value.salleId
  ) {
    return
  }

  const start = formatTime(newForm.value.startTime)
  const end = formatTime(newForm.value.endTime)

  if (start >= end) {
    conflictMessage.value = "L'heure de fin doit être après l'heure de début"
    return
  }

  const selectedDate = formatDateForDB(newForm.value.date)

  // Vérifier les chevauchements
  const hasConflict = reservations.value.some((res) => {
    if (res.date !== selectedDate) return false

    const resStart = res.start_time.substring(0, 5)
    const resEnd = res.end_time.substring(0, 5)

    // Un conflit existe si :
    // (Start1 < End2) AND (End1 > Start2)
    return start < resEnd && end > resStart
  })

  if (hasConflict) {
    conflictMessage.value =
      'Ce créneau est déjà partiellement ou totalement occupé'
  }
}

const submitReservation = async () => {
  if (!isFormValid.value || conflictMessage.value) {
    const toast = await toastController.create({
      message:
        conflictMessage.value ||
        'Veuillez remplir tous les champs obligatoires',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  loading.value = true
  const loadingToast = await loadingController.create({
    message: 'Envoi en cours...'
  })
  await loadingToast.present()

  try {
    const reservationData = {
      salle_id: newForm.value.salleId,
      date: formatDateForDB(newForm.value.date),
      start_time: formatTime(newForm.value.startTime),
      end_time: formatTime(newForm.value.endTime),
      reason: newForm.value.reason,
      name: `${newForm.value.firstName} ${newForm.value.lastName}`.trim(),
      email: newForm.value.email,
      phone: newForm.value.phone,
      status: 'en_attente'
    }

    const { error } = await ReservationService.create(reservationData)

    if (error) throw error

    // Sauvegarder les coordonnées dans le localStorage pour les prochaines fois
    saveUserContact({
      firstName: newForm.value.firstName,
      lastName: newForm.value.lastName,
      email: newForm.value.email,
      phone: newForm.value.phone || ''
    })

    if (newForm.value.email?.trim()) {
      await updatePushTokenEmail(newForm.value.email.trim())
    }

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Demande de réservation envoyée avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.replace('/tabs/reservations')
  } catch (error) {
    console.error('Error submitting reservation:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: "Erreur lors de l'envoi",
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

const loadSalles = async () => {
  try {
    const cityInfo = getCityInfo()
    const communeId = cityInfo?.id

    const { data, error } = await ReservationService.getSalles(communeId)

    if (error) throw error
    if (data) {
      salles.value = data
    }
  } catch (error) {
    console.error('Error loading salles:', error)
    const toast = await toastController.create({
      message: 'Erreur lors du chargement des salles',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
  }
}

onMounted(async () => {
  await loadSalles()

  const savedContact = getUserContact()
  if (savedContact) {
    hasSavedContact.value = true
    newForm.value.firstName = savedContact.firstName || ''
    newForm.value.lastName = savedContact.lastName || ''
    newForm.value.email = savedContact.email || ''
    newForm.value.phone = savedContact.phone || ''
  }

  // Initialiser les heures par défaut proprement
  // (Sinon ça prend l'heure actuelle qui peut être en conflit avec le passé ou autre)
})
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: var(--ion-color-step-800);
}

.salles-section {
  margin-bottom: 18px;
}

.salles-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.salles-helper {
  margin: 0 0 10px 0;
  color: var(--ion-color-step-500);
  font-size: 0.85rem;
}

.empty-salles {
  background: var(--ion-color-step-50);
  border-radius: 12px;
  padding: 14px;
  color: var(--ion-color-step-500);
  font-size: 0.9rem;
}

.salles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.salle-card {
  margin: 0;
  border: 2px solid transparent;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.salle-card.selected {
  border-color: var(--ion-color-primary);
  box-shadow: 0 6px 16px rgba(var(--ion-color-primary-rgb), 0.25);
}

.salle-card:active {
  transform: scale(0.99);
}

.salle-card-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
}

.salle-card-description,
.salle-card-address {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ion-color-step-600);
}

.salle-card-address {
  margin-top: 8px;
  font-weight: 500;
}

.calendar-container {
  margin-top: 10px;
}

.custom-calendar {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  --background: var(--ion-color-light);
  width: 100%;
}

.day-planning {
  background: var(--ion-color-step-50);
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;

  .planning-title {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--ion-color-step-600);
  }

  .no-reservations {
    font-size: 0.9rem;
    color: var(--ion-color-step-400);
    font-style: italic;
  }

  .reservation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--ion-color-step-150);

    &:last-child {
      border-bottom: none;
    }

    .time-slot {
      font-weight: 500;
      color: var(--ion-color-step-800);
    }

    .res-reason {
      margin: 4px 0 0 0;
      font-size: 0.85rem;
      color: var(--ion-color-step-500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .res-status {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      font-weight: 600;

      &.confirmée {
        background: rgba(var(--ion-color-success-rgb), 0.1);
        color: var(--ion-color-success);
      }

      &.en_attente {
        background: rgba(var(--ion-color-warning-rgb), 0.1);
        color: var(--ion-color-warning);
      }
    }
  }
}

.conflict-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  color: var(--ion-color-danger);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
  font-size: 0.9rem;
  font-weight: 500;

  ion-icon {
    font-size: 1.2rem;
  }
}

.saved-contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-success);
  font-size: 14px;
  margin: 0 0 12px 0;
  padding: 8px 12px;
  background: rgba(var(--ion-color-success-rgb), 0.1);
  border-radius: 8px;

  ion-icon {
    font-size: 18px;
  }
}

.contact-information {
  margin-top: 20px;
}

.submit-button {
  margin-top: 30px;
  margin-bottom: 40px;
  --border-radius: 12px;
  font-weight: 600;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
