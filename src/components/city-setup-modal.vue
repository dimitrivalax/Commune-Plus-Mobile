<template>
  <ion-modal :is-open="isOpen" @willDismiss="handleDismiss" :can-dismiss="canDismiss">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Configuration de la commune</ion-title>
        <ion-buttons slot="end" v-if="allowCancel">
          <ion-button @click="handleCancel">Annuler</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="modal-content">
        <div class="modal-header">
          <ion-icon :icon="locationOutline" class="header-icon"></ion-icon>
          <!-- <h2>Informations de votre commune</h2> -->
          <h2>Veuillez rechercher la commune dans la liste ci-dessous</h2>
        </div>

        <form id="city-setup-form" @submit.prevent="handleSubmit">
          <CityTypeahead @select="handleCitySelect" :disabled="isSubmitting" />

          <div class="sub-menu" v-if="!formData.name">
            <p>Si vous ne trouvez pas votre commune, envoyez-nous un email à <strong><a
                  href="mailto:contact@commune-plus.fr">contact@commune-plus.fr</a></strong></p>
          </div>

          <template v-if="formData.name">
            <ion-item v-if="formData.logo" lines="none">
              <IonImg :src="formData.logo" alt="Logo" class="logo-image" />
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">Nom de la commune
                <ion-text color="danger">*</ion-text></ion-label>
              <ion-input class="custom" shape="round" mode="ios" fill="outline" v-model="formData.name" type="text"
                placeholder="Ex: Venerque" required :disabled="true"></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">Code postal <ion-text color="danger">*</ion-text></ion-label>
              <ion-input class="custom" shape="round" mode="ios" fill="outline" v-model="formData.postalCode"
                type="text" placeholder="Ex: 31810" pattern="[0-9]{5}" maxlength="5" required
                :disabled="true"></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">Email de la commune
                <ion-text color="danger">*</ion-text></ion-label>
              <ion-input class="custom" shape="round" mode="ios" fill="outline" v-model="formData.email" type="email"
                placeholder="Ex: contact@mairie.fr" required :disabled="true"></ion-input>
            </ion-item>
          </template>
        </form>
      </div>
    </ion-content>

    <ion-footer v-if="formData.name" class="city-setup-footer">
      <ion-toolbar>
        <ion-button type="submit" form="city-setup-form" expand="block" class="footer-save-button"
          :disabled="!isFormValid || isSubmitting">
          <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
          <span v-else>Enregistrer</span>
        </ion-button>
      </ion-toolbar>
    </ion-footer>
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
  IonImg,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonFooter,
  toastController
} from '@ionic/vue'
import { locationOutline } from 'ionicons/icons'
import { saveCityInfo } from '@/utils/storage'
import CityTypeahead from './city-typeahead.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  allowCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'saved'])

const formData = ref({
  id: null,
  name: '',
  postalCode: '',
  email: 'contact@commune-plus.fr',
  logo: null
})

const isSubmitting = ref(false)
const isSaved = ref(false)

const isFormValid = computed(() => {
  return !!(
    formData.value.id &&
    formData.value.name.trim() &&
    formData.value.postalCode.trim() &&
    formData.value.email.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
  )
})

const canDismiss = computed(() => {
  // Permettre la fermeture si les données sont sauvegardées OU si l'annulation est autorisée
  return isSaved.value || props.allowCancel
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

  const communeId = formData.value.id
  if (!communeId) {
    await showToast('Sélectionnez une commune dans la liste.', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    saveCityInfo({
      name: formData.value.name.trim(),
      postalCode: formData.value.postalCode.trim(),
      email: formData.value.email.trim(),
      logo: formData.value.logo?.trim() || null,
      id: communeId
    })

    const { updatePushTokenCommune } =
      await import('@/services/push-notifications')
    await updatePushTokenCommune(communeId)

    isSaved.value = true
    await showToast('Commune sélectionnée.', 'success')
    emit('saved')
  } catch (error) {
    console.error('Error confirming city selection:', error)
    const errorMessage =
      error.message || 'Erreur lors de la mise à jour des notifications'
    await showToast(errorMessage, 'danger')
  } finally {
    isSubmitting.value = false
  }
}

const handleDismiss = () => {
  emit('close')
}

const handleCancel = () => {
  if (props.allowCancel) {
    emit('close')
  }
}

const handleCitySelect = (city) => {
  formData.value = {
    id: city.id ?? null,
    name: city.name,
    postalCode: city.postalCode,
    email: city.email,
    logo: city.logo ?? null
  }
}

// Réinitialiser le formulaire quand la modale s'ouvre
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      formData.value = {
        id: null,
        name: '',
        postalCode: '',
        email: '',
        logo: null
      }
      isSaved.value = false
    }
  }
)
</script>

<style lang="scss" scoped>
.modal-content {
  max-width: 600px;
  margin: 0 auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;

  .header-icon {
    font-size: 64px;
    color: var(--ion-color-primary);
    margin-bottom: 16px;
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--ion-color-dark);
  }

  p {
    color: var(--ion-color-medium);
    font-size: 14px;
  }
}

.sub-menu {
  margin-top: 72px;
  text-align: center;
}

.logo-image {
  width: 50%;
  height: 50%;
  margin: 0 auto;
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

.city-setup-footer ion-toolbar {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.footer-save-button {
  margin: 0;
}

ion-spinner {
  margin-right: 8px;
}
</style>
