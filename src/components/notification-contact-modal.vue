<template>
  <ion-modal :is-open="isOpen" @willDismiss="handleClose" :can-dismiss="true">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Notifications</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content
      ref="contentRef"
      class="ion-padding notification-contact-content"
      :fullscreen="true"
    >
      <div class="modal-content">
        <div class="modal-header">
          <ion-icon :icon="notificationsOutline" class="header-icon"></ion-icon>
          <h2>Recevoir les notifications</h2>
          <p>
            Vous pouvez renseigner vos coordonnées pour personnaliser les
            notifications. Cette étape est facultative.
          </p>
        </div>

        <form id="notification-contact-form" @submit.prevent="handleSave">
          <ion-item lines="none">
            <ion-label position="stacked">Prénom</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="formData.firstName"
              type="text"
              placeholder="Votre prénom"
              :disabled="isSaving"
            ></ion-input>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Nom</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="formData.lastName"
              type="text"
              placeholder="Votre nom"
              :disabled="isSaving"
            ></ion-input>
          </ion-item>

          <ion-item lines="none">
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              class="custom"
              shape="round"
              mode="ios"
              fill="outline"
              v-model="formData.email"
              type="email"
              placeholder="votre.email@exemple.com"
              :disabled="isSaving"
            ></ion-input>
          </ion-item>

          <div class="form-actions">
            <ion-button
              fill="clear"
              color="medium"
              expand="block"
              type="button"
              @click="handleSkip"
              :disabled="isSaving"
            >
              Plus tard
            </ion-button>
            <ion-button
              type="submit"
              expand="block"
              class="save-button"
              :disabled="isSaving"
            >
              <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
              <span v-else>Enregistrer</span>
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
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
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { useKeyboardScrollReset } from '@/composables/useKeyboardScrollReset'
import { notificationsOutline } from 'ionicons/icons'
import { getUserContact, saveUserContact } from '@/utils/storage'
import { updatePushTokenEmail } from '@/services/push-notifications'
import { updateUserAndCommuneContext } from '@/services/posthog'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const formData = ref({
  firstName: '',
  lastName: '',
  email: ''
})
const isSaving = ref(false)
const contentRef = ref(null)
const { resetScroll: resetModalScroll } = useKeyboardScrollReset(contentRef, {
  when: () => props.isOpen
})

const isEmailValid = computed(() => {
  const email = formData.value.email.trim()
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
})

const showToast = async (message, color = 'danger') => {
  const toast = await toastController.create({
    message,
    duration: 2500,
    color,
    position: 'top'
  })
  await toast.present()
}

const handleSave = async () => {
  if (isSaving.value) return

  if (!isEmailValid.value) {
    await showToast('Veuillez renseigner un email valide.', 'warning')
    return
  }

  isSaving.value = true

  try {
    const existingContact = getUserContact() || {}
    const contactToSave = {
      ...existingContact,
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      email: formData.value.email.trim()
    }

    saveUserContact(contactToSave)

    if (contactToSave.email) {
      await updatePushTokenEmail(contactToSave.email)
    }

    updateUserAndCommuneContext()
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error saving onboarding contact data:', error)
    await showToast("Erreur lors de l'enregistrement", 'danger')
  } finally {
    isSaving.value = false
  }
}

const handleSkip = () => {
  emit('close')
}

const handleClose = async () => {
  await resetModalScroll()
  emit('close')
}

watch(
  () => props.isOpen,
  async (newValue) => {
    if (newValue) {
      const savedContact = getUserContact()
      formData.value = {
        firstName: savedContact?.firstName || '',
        lastName: savedContact?.lastName || '',
        email: savedContact?.email || ''
      }
      return
    }
    await resetModalScroll()
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
  margin-bottom: 24px;

  .header-icon {
    font-size: 56px;
    color: var(--ion-color-primary);
    margin-bottom: 12px;
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 22px;
    font-weight: 600;
    color: var(--ion-color-dark);
  }

  p {
    margin: 0;
    color: var(--ion-color-medium);
    font-size: 14px;
  }
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

.notification-contact-content {
  --padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.form-actions {
  margin-top: 8px;
  padding-bottom: env(safe-area-inset-bottom);
}

.save-button {
  margin-top: 8px;
}

ion-spinner {
  margin-right: 8px;
}
</style>
