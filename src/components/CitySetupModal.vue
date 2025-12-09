<template>
  <ion-modal 
    :is-open="isOpen" 
    @willDismiss="handleDismiss"
    :can-dismiss="canDismiss"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Configuration de la commune</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="modal-content">
        <div class="modal-header">
          <ion-icon :icon="locationOutline" class="header-icon"></ion-icon>
          <h2>Informations de votre commune</h2>
          <p>Veuillez renseigner les informations suivantes pour configurer l'application</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <CityTypeahead
            @select="handleCitySelect"
            :disabled="isSubmitting"
          />

          <ion-item>
            <ion-label position="stacked">Nom de la commune <ion-text color="danger">*</ion-text></ion-label>
            <ion-input
              v-model="formData.name"
              type="text"
              placeholder="Ex: Paris"
              required
              :disabled="isSubmitting"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Code postal <ion-text color="danger">*</ion-text></ion-label>
            <ion-input
              v-model="formData.postalCode"
              type="text"
              placeholder="Ex: 75001"
              pattern="[0-9]{5}"
              maxlength="5"
              required
              :disabled="isSubmitting"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Email de la commune <ion-text color="danger">*</ion-text></ion-label>
            <ion-input
              v-model="formData.email"
              type="email"
              placeholder="Ex: contact@mairie.fr"
              required
              :disabled="isSubmitting"
            ></ion-input>
          </ion-item>

          <div class="form-actions">
            <ion-button
              type="submit"
              expand="block"
              :disabled="!isFormValid || isSubmitting"
            >
              <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
              <span v-else>Enregistrer</span>
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { locationOutline } from 'ionicons/icons'
import { saveCityInfoToDatabase } from '@/utils/storage'
import CityTypeahead from './CityTypeahead.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const formData = ref({
  name: '',
  postalCode: '',
  email: ''
})

const isSubmitting = ref(false)
const isSaved = ref(false)

const isFormValid = computed(() => {
  return !!(
    formData.value.name.trim() &&
    formData.value.postalCode.trim() &&
    formData.value.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
  )
})

const canDismiss = computed(() => {
  return isSaved.value
})

const showToast = async (message, color = 'danger') => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: 'top'
  })
  await toast.present()
}

const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    await saveCityInfoToDatabase({
      name: formData.value.name.trim(),
      postalCode: formData.value.postalCode.trim(),
      email: formData.value.email.trim()
    })

    isSaved.value = true
    await showToast('Informations de la commune enregistrées avec succès', 'success')
    emit('saved')
  } catch (error) {
    console.error('Error saving city info:', error)
    await showToast(
      'Erreur lors de l\'enregistrement. Les données ont été sauvegardées localement.',
      'warning'
    )
    // Les données sont quand même sauvegardées dans le localStorage grâce au fallback dans saveCityInfoToDatabase
    isSaved.value = true
    emit('saved')
  } finally {
    isSubmitting.value = false
  }
}

const handleDismiss = () => {
  emit('close')
}

const handleCitySelect = (city) => {
  // Remplir automatiquement les champs du formulaire avec la commune sélectionnée
  formData.value = {
    name: city.name,
    postalCode: city.postalCode,
    email: city.email
  }
}

// Réinitialiser le formulaire quand la modale s'ouvre
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    formData.value = {
      name: '',
      postalCode: '',
      email: ''
    }
    isSaved.value = false
  }
})
</script>

<style scoped>
.modal-content {
  max-width: 600px;
  margin: 0 auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  font-size: 64px;
  color: var(--ion-color-primary);
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.modal-header p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 14px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-label {
  font-weight: 500;
  margin-bottom: 8px;
}

.form-actions {
  margin-top: 32px;
}

ion-button {
  margin-top: 8px;
}

ion-spinner {
  margin-right: 8px;
}
</style>

