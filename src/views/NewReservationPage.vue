<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/reservations"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouvelle réservation</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Nouvelle réservation</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <ion-item>
          <ion-label position="stacked">Salle</ion-label>
          <ion-select v-model="roomName" placeholder="Sélectionner une salle">
            <ion-select-option value="Salle des fêtes">Salle des fêtes</ion-select-option>
            <ion-select-option value="Salle polyvalente">Salle polyvalente</ion-select-option>
            <ion-select-option value="Salle de réunion">Salle de réunion</ion-select-option>
            <ion-select-option value="Salle de sport">Salle de sport</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item button @click="openDateModal = true">
          <ion-label position="stacked">Date</ion-label>
          <ion-input
            :value="date ? formatDisplayDate(date) : 'Sélectionner une date'"
            readonly
            placeholder="Sélectionner une date"
          ></ion-input>
        </ion-item>

        <ion-item button @click="openStartTimeModal = true">
          <ion-label position="stacked">Heure de début</ion-label>
          <ion-input
            :value="startTime ? formatDisplayTime(startTime) : 'Sélectionner une heure'"
            readonly
            placeholder="Sélectionner une heure"
          ></ion-input>
        </ion-item>

        <ion-item button @click="openEndTimeModal = true">
          <ion-label position="stacked">Heure de fin</ion-label>
          <ion-input
            :value="endTime ? formatDisplayTime(endTime) : 'Sélectionner une heure'"
            readonly
            placeholder="Sélectionner une heure"
          ></ion-input>
        </ion-item>

        <!-- Modal pour la date -->
        <ion-modal :is-open="openDateModal" @didDismiss="openDateModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Sélectionner une date</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="openDateModal = false">Fermer</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-datetime
              v-model="date"
              presentation="date"
              :min="minDate"
              @ionChange="handleDateChange"
            ></ion-datetime>
          </ion-content>
        </ion-modal>

        <!-- Modal pour l'heure de début -->
        <ion-modal :is-open="openStartTimeModal" @didDismiss="openStartTimeModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Heure de début</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="openStartTimeModal = false">Fermer</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-datetime
              v-model="startTime"
              presentation="time"
              @ionChange="handleStartTimeChange"
            ></ion-datetime>
          </ion-content>
        </ion-modal>

        <!-- Modal pour l'heure de fin -->
        <ion-modal :is-open="openEndTimeModal" @didDismiss="openEndTimeModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Heure de fin</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="openEndTimeModal = false">Fermer</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-datetime
              v-model="endTime"
              presentation="time"
              @ionChange="handleEndTimeChange"
            ></ion-datetime>
          </ion-content>
        </ion-modal>

        <ion-item>
          <ion-label position="stacked">Raison de la réservation</ion-label>
          <ion-textarea
            v-model="reason"
            placeholder="Décrivez l'événement..."
            rows="4"
          ></ion-textarea>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Nom</ion-label>
          <ion-input v-model="name" placeholder="Votre nom"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email" placeholder="Votre email"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Téléphone</ion-label>
          <ion-input v-model="phone" type="tel" placeholder="Votre téléphone"></ion-input>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonModal, IonDatetime, IonTextarea, IonInput, IonButton, IonIcon, loadingController, toastController } from '@ionic/vue'
import { checkmark } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { formatDateForDB, formatTime } from '@/utils/date'

const router = useRouter()
const roomName = ref('')
const date = ref('')
const startTime = ref('')
const endTime = ref('')
const reason = ref('')
const name = ref('')
const email = ref('')
const phone = ref('')
const loading = ref(false)
const openDateModal = ref(false)
const openStartTimeModal = ref(false)
const openEndTimeModal = ref(false)

const minDate = new Date().toISOString()

const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDisplayTime = (timeString) => {
  if (!timeString) return ''
  // Si c'est au format ISO (avec T), extraire la partie time
  if (timeString.includes('T')) {
    const time = timeString.split('T')[1]?.substring(0, 5) || timeString
    return time
  }
  // Si c'est déjà au format HH:mm
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString
  }
  return timeString
}

const handleDateChange = (event) => {
  date.value = event.detail.value
  // Fermer le modal après un court délai pour permettre à l'utilisateur de voir la sélection
  setTimeout(() => {
    openDateModal.value = false
  }, 300)
}

const handleStartTimeChange = (event) => {
  startTime.value = event.detail.value
  setTimeout(() => {
    openStartTimeModal.value = false
  }, 300)
}

const handleEndTimeChange = (event) => {
  endTime.value = event.detail.value
  setTimeout(() => {
    openEndTimeModal.value = false
  }, 300)
}

const isFormValid = computed(() => {
  return roomName.value && date.value && startTime.value && endTime.value && name.value && email.value
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
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          room_name: roomName.value,
          date: formatDateForDB(date.value),
          start_time: formatTime(startTime.value),
          end_time: formatTime(endTime.value),
          reason: reason.value,
          name: name.value,
          email: email.value,
          phone: phone.value,
          status: 'en_attente'
        }
      ])
      .select()

    if (error) throw error

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Demande de réservation envoyée avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/reservations')
  } catch (error) {
    console.error('Error submitting reservation:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Erreur lors de l\'envoi',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}
</script>

