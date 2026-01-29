<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reservations"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouvelle réservation</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title size="large">Nouvelle réservation</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-item lines="none">
          <ion-label position="stacked">Salle</ion-label>
          <ion-select
            v-model="newForm.salleId"
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

        <!-- Modal pour la date -->
        <ion-item lines="none">
          <ion-label>Date</ion-label>
          <ion-datetime-button datetime="datetime"></ion-datetime-button>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="datetime"
              :show-default-buttons="true"
              presentation="date"
              :value="newForm.date"
              @ionChange="
                (event) => {
                  newForm.date = event.detail.value
                }
              "
            ></ion-datetime>
          </ion-modal>
        </ion-item>

        <ion-item lines="none">
          <ion-label>Heure de début</ion-label>
          <ion-datetime-button datetime="start-time"></ion-datetime-button>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="start-time"
              :show-default-buttons="true"
              presentation="time"
              :value="newForm.startTime"
              @ionChange="
                (event) => {
                  newForm.startTime = event.detail.value
                }
              "
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
                }
              "
            ></ion-datetime>
          </ion-modal>
        </ion-item>

        <ion-item lines="none">
          <ion-label position="stacked">Raison de la réservation</ion-label>
          <ion-textarea
            v-model="newForm.reason"
            placeholder="Décrivez l'événement..."
            rows="4"
          ></ion-textarea>
        </ion-item>

        <p v-if="hasSavedContact" class="saved-contact-info">
          <ion-icon :icon="checkmarkCircleOutline" />
          Coordonnées pré-remplies depuis votre dernière utilisation
        </p>

        <ion-item lines="none">
          <ion-label position="stacked">Nom</ion-label>
          <ion-input v-model="newForm.name" placeholder="Votre nom"></ion-input>
        </ion-item>

        <ion-item lines="none">
          <ion-label position="stacked">Email</ion-label>
          <ion-input
            v-model="newForm.email"
            type="email"
            placeholder="Votre email"
          ></ion-input>
        </ion-item>

        <ion-item lines="none">
          <ion-label position="stacked">Téléphone</ion-label>
          <ion-input
            v-model="newForm.phone"
            type="tel"
            placeholder="Votre téléphone"
          ></ion-input>
        </ion-item>

        <ion-button
          expand="block"
          @click="submitReservation"
          :disabled="loading || !isFormValid"
        >
          <ion-icon :icon="checkmark" slot="start" />
          Envoyer la demande
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
  IonSelect,
  IonSelectOption,
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
import { checkmark, checkmarkCircleOutline } from 'ionicons/icons'
import { ReservationService } from '@/services/reservation-service'
import { formatDateForDB, formatTime } from '@/utils/date'
import { saveUserContact, getUserContact, getCityInfo } from '@/utils/storage'

const router = useRouter()

const newForm = ref({
  salleId: '',
  date: new Date().toISOString(),
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  reason: '',
  name: '',
  email: '',
  phone: ''
})

const loading = ref(false)
const hasSavedContact = ref(false)
const salles = ref([])

const isFormValid = computed(() => {
  return (
    newForm.value.salleId &&
    newForm.value.date &&
    newForm.value.startTime &&
    newForm.value.endTime &&
    newForm.value.name &&
    newForm.value.email
  )
})

const submitReservation = async () => {
  if (!isFormValid.value) {
    const toast = await toastController.create({
      message: 'Veuillez remplir tous les champs obligatoires',
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
      name: newForm.value.name,
      email: newForm.value.email,
      phone: newForm.value.phone,
      status: 'en_attente'
    }

    const { error } = await ReservationService.create(reservationData)

    if (error) throw error

    // Sauvegarder les coordonnées dans le localStorage pour les prochaines fois
    const nameParts = newForm.value.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    saveUserContact({
      firstName: firstName,
      lastName: lastName,
      email: newForm.value.email,
      phone: newForm.value.phone || ''
    })

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
    if (savedContact.firstName || savedContact.lastName) {
      newForm.value.name =
        `${savedContact.firstName} ${savedContact.lastName}`.trim()
    }
    newForm.value.email = savedContact.email || ''
    newForm.value.phone = savedContact.phone || ''
  }
})
</script>

<style lang="scss" scoped>
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
</style>
