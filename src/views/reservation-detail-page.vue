<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button
            default-href="/tabs/reservations"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>Détail de la réservation</ion-title>
        <ion-buttons slot="end">
          <ion-button
            @click="toggleEditMode"
            v-if="!isDeleting && isOwner"
            color="light"
          >
            <ion-icon :icon="isEditing ? close : create" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="page-content">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement...</p>
      </div>

      <div v-else-if="reservation" class="detail-container">
        <!-- Mode affichage -->
        <div v-if="!isEditing" class="view-mode">
          <!-- Informations principales -->
          <ion-card class="info-card">
            <ion-card-header>
              <div class="card-header-row">
                <ion-card-title>Réservation</ion-card-title>
                <ion-badge :color="getStatusColor(reservation.status)">
                  {{ getStatusLabel(reservation.status) }}
                </ion-badge>
              </div>
            </ion-card-header>
            <ion-card-content>
              <p class="room-name">
                {{
                  reservation.salle?.nom ||
                  reservation.salle_nom ||
                  'Salle inconnue'
                }}
              </p>
              <p v-if="reservation.reason" class="reason-text">
                <strong>Raison :</strong> {{ reservation.reason }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Date et heures -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="calendar" /> Date et heures
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>
                <strong>Date :</strong>
                {{ formatDisplayDate(reservation.date) }}
              </p>
              <p>
                <strong>Heure de début :</strong>
                {{ formatDisplayTime(reservation.start_time) }}
              </p>
              <p>
                <strong>Heure de fin :</strong>
                {{ formatDisplayTime(reservation.end_time) }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Coordonnées du demandeur -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="person" /> Coordonnées
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Nom :</strong> {{ reservation.name }}</p>
              <p v-if="reservation.email">
                <strong>Email :</strong> {{ reservation.email }}
              </p>
              <p v-if="reservation.phone">
                <strong>Téléphone :</strong> {{ reservation.phone }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Bouton de suppression (seulement pour le propriétaire) -->
          <div v-if="isOwner" class="action-buttons">
            <ion-button
              expand="block"
              color="danger"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <template v-slot:start>
                <ion-icon :icon="trash" />
              </template>
              Supprimer la réservation
            </ion-button>
          </div>
          <div v-else class="owner-notice">
            <p>
              Vous ne pouvez modifier ou supprimer que les réservations que vous
              avez créées.
            </p>
          </div>
        </div>

        <!-- Mode édition -->
        <div v-else class="edit-mode">
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">Réservation</h3>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Salle</ion-label>
                <ion-select
                  v-model="editForm.salleId"
                  placeholder="Sélectionner une salle"
                >
                  <ion-select-option
                    v-for="salle in salles"
                    :key="salle.id"
                    :value="salle.id"
                  >
                    {{ salle.nom }}
                  </ion-select-option>
                </ion-select>
              </ion-item>

              <!-- Date -->
              <ion-item lines="none" class="form-item">
                <ion-label>Date</ion-label>
                <ion-datetime-button
                  datetime="edit-datetime"
                ></ion-datetime-button>
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime
                    id="edit-datetime"
                    :show-default-buttons="true"
                    presentation="date"
                    :min="minDate"
                    :value="editForm.date"
                    @ionChange="
                      (event) => {
                        editForm.date = event.detail.value
                      }
                    "
                  ></ion-datetime>
                </ion-modal>
              </ion-item>

              <!-- Heure de début -->
              <ion-item lines="none" class="form-item">
                <ion-label>Heure de début</ion-label>
                <ion-datetime-button
                  datetime="edit-start-time"
                ></ion-datetime-button>
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime
                    id="edit-start-time"
                    :show-default-buttons="true"
                    presentation="time"
                    :value="editForm.startTime"
                    @ionChange="
                      (event) => {
                        editForm.startTime = event.detail.value
                      }
                    "
                  ></ion-datetime>
                </ion-modal>
              </ion-item>

              <!-- Heure de fin -->
              <ion-item lines="none" class="form-item">
                <ion-label>Heure de fin</ion-label>
                <ion-datetime-button
                  datetime="edit-end-time"
                ></ion-datetime-button>
                <ion-modal :keep-contents-mounted="true">
                  <ion-datetime
                    id="edit-end-time"
                    :show-default-buttons="true"
                    presentation="time"
                    :value="editForm.endTime"
                    @ionChange="
                      (event) => {
                        editForm.endTime = event.detail.value
                      }
                    "
                  ></ion-datetime>
                </ion-modal>
              </ion-item>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked"
                  >Raison de la réservation (obligatoire)</ion-label
                >
                <ion-textarea
                  shape="round"
                  mode="ios"
                  fill="outline"
                  class="custom"
                  v-model="editForm.reason"
                  placeholder="Décrivez l'événement..."
                  rows="4"
                ></ion-textarea>
              </ion-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">Coordonnées</h3>
              <ion-card class="contact-card">
                <ion-card-content>
                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Nom *</ion-label>
                    <ion-input
                      class="custom"
                      shape="round"
                      mode="ios"
                      fill="outline"
                      v-model="editForm.name"
                      placeholder="Votre nom"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Email *</ion-label>
                    <ion-input
                      class="custom"
                      shape="round"
                      mode="ios"
                      fill="outline"
                      v-model="editForm.email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Téléphone</ion-label>
                    <ion-input
                      class="custom"
                      shape="round"
                      mode="ios"
                      fill="outline"
                      v-model="editForm.phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                    ></ion-input>
                  </ion-item>
                </ion-card-content>
              </ion-card>
            </div>

            <div class="action-buttons">
              <ion-button
                expand="block"
                @click="saveChanges"
                :disabled="saving || !isFormValid"
                class="save-button"
              >
                <template v-slot:start>
                  <ion-icon :icon="checkmark" />
                </template>
                Enregistrer les modifications
              </ion-button>
              <ion-button
                expand="block"
                fill="outline"
                @click="cancelEdit"
                :disabled="saving"
              >
                Annuler
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-container">
        <ion-icon :icon="alertCircle" class="error-icon" />
        <h3>Réservation introuvable</h3>
        <ion-button expand="block" @click="$router.push('/tabs/reservations')">
          Retour à la liste
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonSpinner,
  loadingController,
  toastController,
  alertController
} from '@ionic/vue'
import {
  create,
  close,
  trash,
  checkmark,
  calendar,
  person,
  time,
  alertCircle
} from 'ionicons/icons'
import { ReservationService } from '@/services/reservation-service'
import { formatDateTime, formatDateForDB, formatTime } from '@/utils/date'
import { getUserContact, getCityInfo } from '@/utils/storage'

const route = useRoute()
const router = useRouter() // eslint-disable-line no-unused-vars

const reservation = ref(null)
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const isDeleting = ref(false)
const isOwner = ref(false)

const salles = ref([])

const minDate = new Date().toISOString()

const editForm = ref({
  salleId: '',
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
  name: '',
  email: '',
  phone: ''
})

const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  if (typeof dateString === 'string' && dateString.includes('T')) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  // Si c'est déjà au format YYYY-MM-DD
  if (
    typeof dateString === 'string' &&
    dateString.match(/^\d{4}-\d{2}-\d{2}$/)
  ) {
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return dateString
}

const formatDisplayTime = (timeString) => {
  if (!timeString) return ''
  // Si c'est au format ISO (avec T), extraire la partie time
  if (timeString.includes('T')) {
    const time = timeString.split('T')[1]?.substring(0, 5) || timeString
    return time
  }
  // Si c'est déjà au format HH:mm
  if (timeString.match(/^\d{2}:\d{2}/)) {
    return timeString.substring(0, 5)
  }
  return timeString
}

const convertDateForDatetime = (dateString) => {
  if (!dateString) return ''
  try {
    if (dateString.includes('T')) {
      const testDate = new Date(dateString)
      if (isNaN(testDate.getTime())) return ''
      return dateString
    }
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateString + 'T00:00:00')
      if (isNaN(date.getTime())) return ''
      return date.toISOString()
    }
  } catch (error) {
    console.error('Error converting date:', error, dateString)
    return ''
  }
  return dateString
}

const convertTimeForDatetime = (timeString) => {
  if (!timeString) return ''
  try {
    if (timeString.includes('T')) {
      const testDate = new Date(timeString)
      if (isNaN(testDate.getTime())) return ''
      return timeString
    }
    if (timeString.match(/^\d{2}:\d{2}/)) {
      const timeMatch = timeString.match(/^(\d{2}):(\d{2})/)
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10)
        const minutes = parseInt(timeMatch[2], 10)
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          const today = new Date().toISOString().split('T')[0]
          const date = new Date(`${today}T${timeMatch[0]}:00`)
          if (isNaN(date.getTime())) return ''
          return date.toISOString()
        }
      }
      return ''
    }
  } catch (error) {
    console.error('Error converting time:', error, timeString)
    return ''
  }
  return ''
}

const isFormValid = computed(() => {
  return (
    editForm.value.salleId &&
    editForm.value.date &&
    editForm.value.startTime &&
    editForm.value.endTime &&
    editForm.value.name &&
    editForm.value.email &&
    editForm.value.reason &&
    editForm.value.reason.trim() !== ''
  )
})

const loadReservation = async () => {
  loading.value = true
  try {
    const { data, error } = await ReservationService.getById(route.params.id)

    if (error) throw error

    reservation.value = data
    if (data.salle) {
      reservation.value.salle_nom = data.salle.nom
    }

    const userContact = getUserContact()
    if (userContact && userContact.email && data.email) {
      isOwner.value =
        userContact.email.toLowerCase() === data.email.toLowerCase()
    } else {
      if (userContact && userContact.name && data.name) {
        isOwner.value =
          userContact.name.toLowerCase() === data.name.toLowerCase()
      }
    }

    const convertedDate = convertDateForDatetime(data.date)
    const convertedStartTime = convertTimeForDatetime(data.start_time)
    const convertedEndTime = convertTimeForDatetime(data.end_time)

    const defaultDate = new Date()
    defaultDate.setHours(0, 0, 0, 0)
    const defaultTime = new Date()

    editForm.value = {
      salleId: data.salle_id || '',
      date: convertedDate || defaultDate.toISOString(),
      startTime: convertedStartTime || defaultTime.toISOString(),
      endTime: convertedEndTime || defaultTime.toISOString(),
      reason: data.reason || '',
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || ''
    }
  } catch (error) {
    console.error('Error loading reservation:', error)
    const toast = await toastController.create({
      message: 'Erreur lors du chargement de la réservation',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

const toggleEditMode = async () => {
  isEditing.value = !isEditing.value
  if (isEditing.value && reservation.value) {
    if (salles.value.length === 0) {
      await loadSalles()
    }
    const convertedDate = convertDateForDatetime(reservation.value.date)
    const convertedStartTime = convertTimeForDatetime(
      reservation.value.start_time
    )
    const convertedEndTime = convertTimeForDatetime(reservation.value.end_time)

    const defaultDate = new Date()
    defaultDate.setHours(0, 0, 0, 0)
    const defaultTime = new Date()

    editForm.value = {
      salleId: reservation.value.salle_id || '',
      date: convertedDate || defaultDate.toISOString(),
      startTime: convertedStartTime || defaultTime.toISOString(),
      endTime: convertedEndTime || defaultTime.toISOString(),
      reason: reservation.value.reason || '',
      name: reservation.value.name || '',
      email: reservation.value.email || '',
      phone: reservation.value.phone || ''
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveChanges = async () => {
  if (!isOwner.value) {
    const toast = await toastController.create({
      message: 'Vous ne pouvez modifier que vos propres réservations',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  if (!isFormValid.value) {
    const toast = await toastController.create({
      message: 'Veuillez remplir tous les champs obligatoires',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  const userContact = getUserContact()
  if (!userContact || !userContact.email) {
    const toast = await toastController.create({
      message:
        'Impossible de vérifier votre identité. Veuillez créer une nouvelle réservation.',
      duration: 3000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  saving.value = true
  const loadingToast = await loadingController.create({
    message: 'Enregistrement en cours...'
  })
  await loadingToast.present()

  try {
    const updates = {
      salle_id: editForm.value.salleId,
      date: formatDateForDB(editForm.value.date),
      start_time: formatTime(editForm.value.startTime),
      end_time: formatTime(editForm.value.endTime),
      reason: editForm.value.reason,
      name: editForm.value.name,
      email: editForm.value.email,
      phone: editForm.value.phone || null
    }

    const { data, error } = await ReservationService.update(
      route.params.id,
      userContact.email,
      updates
    )

    if (error) throw error

    reservation.value = data
    isEditing.value = false

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Modifications enregistrées avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    await loadReservation()
  } catch (error) {
    console.error('Error updating reservation:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: "Erreur lors de l'enregistrement",
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message:
      'Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          deleteReservation()
        }
      }
    ]
  })

  await alert.present()
}

const deleteReservation = async () => {
  if (!isOwner.value) {
    const toast = await toastController.create({
      message: 'Vous ne pouvez supprimer que vos propres réservations',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  const userContact = getUserContact()
  if (!userContact || !userContact.email) {
    const toast = await toastController.create({
      message:
        'Impossible de vérifier votre identité. Veuillez créer une nouvelle réservation.',
      duration: 3000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  isDeleting.value = true
  const loadingToast = await loadingController.create({
    message: 'Suppression en cours...'
  })
  await loadingToast.present()

  try {
    const { error } = await ReservationService.delete(
      route.params.id,
      userContact.email
    )

    if (error) throw error

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Réservation supprimée avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.replace('/tabs/reservations')
  } catch (error) {
    console.error('Error deleting reservation:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Erreur lors de la suppression',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    isDeleting.value = false
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
  await loadReservation()
})
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.detail-container {
  padding: 16px;
}

.view-mode,
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  margin: 0;
  border-radius: 12px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: var(--ion-color-dark);
}

.room-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.reason-text {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ion-color-light);
  color: var(--ion-color-medium);
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  height: 48px;
  font-weight: 600;
}

.form-container {
  padding: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  gap: 16px;

  .error-icon {
    font-size: 48px;
    color: var(--ion-color-danger);
  }
}

.owner-notice {
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 14px;
  font-style: italic;
  margin-top: 16px;
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
