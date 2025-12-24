<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reservations"></ion-back-button>
        </ion-buttons>
        <ion-title>Détail de la réservation</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleEditMode" v-if="!isDeleting && isOwner">
            <ion-icon :icon="isEditing ? close : create" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
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
              <p class="room-name">{{ reservation.room_name }}</p>
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
              <p><strong>Date :</strong> {{ formatDisplayDate(reservation.date) }}</p>
              <p><strong>Heure de début :</strong> {{ formatDisplayTime(reservation.start_time) }}</p>
              <p><strong>Heure de fin :</strong> {{ formatDisplayTime(reservation.end_time) }}</p>
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
              <p v-if="reservation.email"><strong>Email :</strong> {{ reservation.email }}</p>
              <p v-if="reservation.phone"><strong>Téléphone :</strong> {{ reservation.phone }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Métadonnées -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="time" /> Informations
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Date de création :</strong> {{ formatDateTime(reservation.created_at) }}</p>
              <p v-if="reservation.updated_at !== reservation.created_at">
                <strong>Dernière modification :</strong> {{ formatDateTime(reservation.updated_at) }}
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
              <ion-icon :icon="trash" slot="start" />
              Supprimer la réservation
            </ion-button>
          </div>
          <div v-else class="owner-notice">
            <p>Vous ne pouvez modifier ou supprimer que les réservations que vous avez créées.</p>
          </div>
        </div>

        <!-- Mode édition -->
        <div v-else class="edit-mode">
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">Réservation</h3>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Salle</ion-label>
                <ion-select v-model="editForm.roomName" placeholder="Sélectionner une salle">
                  <ion-select-option value="Salle des fêtes">Salle des fêtes</ion-select-option>
                  <ion-select-option value="Salle polyvalente">Salle polyvalente</ion-select-option>
                  <ion-select-option value="Salle de réunion">Salle de réunion</ion-select-option>
                  <ion-select-option value="Salle de sport">Salle de sport</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item button @click="openDateModal = true" lines="none" class="form-item">
                <ion-label position="stacked">Date</ion-label>
                <ion-input
                  :value="editForm.date ? formatDisplayDate(editForm.date) : 'Sélectionner une date'"
                  readonly
                  placeholder="Sélectionner une date"
                ></ion-input>
              </ion-item>

              <ion-item button @click="openStartTimeModal = true" lines="none" class="form-item">
                <ion-label position="stacked">Heure de début</ion-label>
                <ion-input
                  :value="editForm.startTime ? formatDisplayTime(editForm.startTime) : 'Sélectionner une heure'"
                  readonly
                  placeholder="Sélectionner une heure"
                ></ion-input>
              </ion-item>

              <ion-item button @click="openEndTimeModal = true" lines="none" class="form-item">
                <ion-label position="stacked">Heure de fin</ion-label>
                <ion-input
                  :value="editForm.endTime ? formatDisplayTime(editForm.endTime) : 'Sélectionner une heure'"
                  readonly
                  placeholder="Sélectionner une heure"
                ></ion-input>
              </ion-item>

              <!-- Modal pour la date -->
              <ion-modal :is-open="openDateModal" @didDismiss="openDateModal = false">
                <ion-header>
                  <ion-toolbar color="primary">
                    <ion-title>Sélectionner une date</ion-title>
                    <ion-buttons slot="end">
                      <ion-button @click="openDateModal = false">Fermer</ion-button>
                    </ion-buttons>
                  </ion-toolbar>
                </ion-header>
                <ion-content>
                  <ion-datetime
                    v-model="editForm.date"
                    presentation="date"
                    :min="minDate"
                    @ionChange="handleDateChange"
                  ></ion-datetime>
                </ion-content>
              </ion-modal>

              <!-- Modal pour l'heure de début -->
              <ion-modal :is-open="openStartTimeModal" @didDismiss="openStartTimeModal = false">
                <ion-header>
                  <ion-toolbar color="primary">
                    <ion-title>Sélectionner une heure de début</ion-title>
                    <ion-buttons slot="end">
                      <ion-button @click="openStartTimeModal = false">Fermer</ion-button>
                    </ion-buttons>
                  </ion-toolbar>
                </ion-header>
                <ion-content>
                  <ion-datetime
                    v-model="editForm.startTime"
                    presentation="time"
                    @ionChange="handleStartTimeChange"
                  ></ion-datetime>
                </ion-content>
              </ion-modal>

              <!-- Modal pour l'heure de fin -->
              <ion-modal :is-open="openEndTimeModal" @didDismiss="openEndTimeModal = false">
                <ion-header>
                  <ion-toolbar color="primary">
                    <ion-title>Sélectionner une heure de fin</ion-title>
                    <ion-buttons slot="end">
                      <ion-button @click="openEndTimeModal = false">Fermer</ion-button>
                    </ion-buttons>
                  </ion-toolbar>
                </ion-header>
                <ion-content>
                  <ion-datetime
                    v-model="editForm.endTime"
                    presentation="time"
                    @ionChange="handleEndTimeChange"
                  ></ion-datetime>
                </ion-content>
              </ion-modal>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Raison de la réservation</ion-label>
                <ion-textarea
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
                      v-model="editForm.name"
                      placeholder="Votre nom"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Email *</ion-label>
                    <ion-input
                      v-model="editForm.email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Téléphone</ion-label>
                    <ion-input
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
                <ion-icon :icon="checkmark" slot="start" />
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonItem, IonLabel, IonTextarea, IonInput, IonSelect, IonSelectOption, IonModal, IonDatetime, IonSpinner, loadingController, toastController, alertController } from '@ionic/vue'
import { create, close, trash, checkmark, calendar, person, time, alertCircle } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { formatDateTime, formatDateForDB, formatTime } from '@/utils/date'
import { getUserContact } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const reservation = ref(null)
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const isDeleting = ref(false)
const isOwner = ref(false)

const openDateModal = ref(false)
const openStartTimeModal = ref(false)
const openEndTimeModal = ref(false)

const minDate = new Date().toISOString()

const editForm = ref({
  roomName: '',
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
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
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

const handleDateChange = (event) => {
  editForm.value.date = event.detail.value
  setTimeout(() => {
    openDateModal.value = false
  }, 300)
}

const handleStartTimeChange = (event) => {
  editForm.value.startTime = event.detail.value
  setTimeout(() => {
    openStartTimeModal.value = false
  }, 300)
}

const handleEndTimeChange = (event) => {
  editForm.value.endTime = event.detail.value
  setTimeout(() => {
    openEndTimeModal.value = false
  }, 300)
}

const isFormValid = computed(() => {
  return editForm.value.roomName && 
         editForm.value.date && 
         editForm.value.startTime && 
         editForm.value.endTime && 
         editForm.value.name && 
         editForm.value.email
})

const loadReservation = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    reservation.value = data
    
    // Vérifier si l'utilisateur actuel est le propriétaire de la réservation
    const userContact = getUserContact()
    if (userContact && userContact.email && data.email) {
      isOwner.value = userContact.email.toLowerCase() === data.email.toLowerCase()
    } else {
      // Si pas d'email dans le localStorage, vérifier avec le nom aussi
      if (userContact && userContact.name && data.name) {
        isOwner.value = userContact.name.toLowerCase() === data.name.toLowerCase()
      }
    }
    
    // Initialiser le formulaire d'édition
    editForm.value = {
      roomName: data.room_name || '',
      date: data.date || '',
      startTime: data.start_time || '',
      endTime: data.end_time || '',
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

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value && reservation.value) {
    // Réinitialiser le formulaire avec les valeurs actuelles
    editForm.value = {
      roomName: reservation.value.room_name || '',
      date: reservation.value.date || '',
      startTime: reservation.value.start_time || '',
      endTime: reservation.value.end_time || '',
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
  // Vérifier à nouveau que l'utilisateur est le propriétaire
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
      message: 'Impossible de vérifier votre identité. Veuillez créer une nouvelle réservation.',
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
    // Mettre à jour uniquement si l'email correspond
    const { data, error } = await supabase
      .from('reservations')
      .update({
        room_name: editForm.value.roomName,
        date: formatDateForDB(editForm.value.date),
        start_time: formatTime(editForm.value.startTime),
        end_time: formatTime(editForm.value.endTime),
        reason: editForm.value.reason,
        name: editForm.value.name,
        email: editForm.value.email,
        phone: editForm.value.phone || null
      })
      .eq('id', route.params.id)
      .eq('email', userContact.email.toLowerCase())
      .select()
      .single()

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
    
    // Recharger les données pour afficher les modifications
    await loadReservation()
  } catch (error) {
    console.error('Error updating reservation:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Erreur lors de l\'enregistrement',
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
    message: 'Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.',
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
  // Vérifier à nouveau que l'utilisateur est le propriétaire
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
      message: 'Impossible de vérifier votre identité. Veuillez créer une nouvelle réservation.',
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
    // Supprimer uniquement si l'email correspond
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', route.params.id)
      .eq('email', userContact.email.toLowerCase())

    if (error) throw error

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Réservation supprimée avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    // Utiliser replace pour forcer le rechargement de la liste
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

onMounted(() => {
  loadReservation()
})
</script>

<style scoped>
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
}

.room-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-light);
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

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-light);
  margin: 0 0 16px 0;
  padding: 0 4px;
}

.form-item {
  --background: var(--ion-color-light);
  --border-radius: 12px;
  margin-bottom: 16px;
  padding: 4px 0;
}

.contact-card {
  margin: 0;
  background: var(--ion-color-light);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.error-container h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-light);
  margin: 0 0 24px 0;
}

.owner-notice {
  margin-top: 24px;
  padding: 16px;
  background: rgba(var(--ion-color-warning-rgb), 0.1);
  border-radius: 12px;
  text-align: center;
}

.owner-notice p {
  margin: 0;
  color: var(--ion-color-warning);
  font-size: 14px;
}
</style>

