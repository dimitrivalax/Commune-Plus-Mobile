<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/propositions"></IonBackButton>
        </IonButtons>
        <IonTitle>Nouvelle Doléance</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div class="form-container">
        <div class="form-section">
          <h3 class="section-title">Ma proposition</h3>

          <IonItem lines="none" class="form-item">
            <IonLabel position="stacked">Nom de la doléance *</IonLabel>
            <IonInput
              v-model="name"
              placeholder="Ex: Aménagement du parc"
              class="custom-input"
            ></IonInput>
          </IonItem>

          <IonItem lines="none" class="form-item">
            <IonLabel position="stacked"
              >Description détaillée * (min. 100 caractères)</IonLabel
            >
            <IonTextarea
              v-model="description"
              placeholder="Décrivez votre proposition en détail..."
              rows="8"
              class="custom-textarea"
            ></IonTextarea>
            <div
              class="char-counter"
              :class="{ error: description.length < 100 }"
            >
              {{ description.length }} / 100 caractères minimum
            </div>
          </IonItem>
        </div>

        <div class="form-section">
          <h3 class="section-title">Photo (Optionnelle)</h3>
          <div v-if="photo" class="photo-preview-container">
            <img
              :src="photo"
              alt="Photo de la doléance"
              class="photo-preview"
            />
            <IonButton
              fill="clear"
              @click="photo = null"
              class="remove-photo-btn"
            >
              <IonIcon :icon="closeCircle" />
            </IonButton>
          </div>
          <IonButton
            v-else
            expand="block"
            fill="outline"
            @click="takePhoto"
            class="photo-button"
          >
            <IonIcon :icon="camera" slot="start" />
            Ajouter une photo
          </IonButton>
        </div>

        <div class="form-section">
          <h3 class="section-title">Vos informations</h3>
          <p class="section-subtitle">
            Ces informations seront affichées avec votre doléance.
          </p>

          <IonItem lines="none" class="form-item">
            <IonLabel position="stacked">Prénom *</IonLabel>
            <IonInput v-model="firstName" placeholder="Votre prénom"></IonInput>
          </IonItem>

          <IonItem lines="none" class="form-item">
            <IonLabel position="stacked">Nom *</IonLabel>
            <IonInput v-model="lastName" placeholder="Votre nom"></IonInput>
          </IonItem>

          <IonItem lines="none" class="form-item">
            <IonLabel position="stacked"
              >Email * (ne sera pas affiché publiquement)</IonLabel
            >
            <IonInput
              v-model="email"
              type="email"
              placeholder="votre@email.com"
            ></IonInput>
          </IonItem>
        </div>

        <div class="submit-section">
          <IonButton
            expand="block"
            @click="submitProposition"
            :disabled="!isValid || loading"
            class="submit-button"
          >
            <IonSpinner v-if="loading" name="crescent" slot="start" />
            {{ loading ? 'Envoi en cours...' : 'Publier ma doléance' }}
          </IonButton>
        </div>
      </div>
    </IonContent>
  </IonPage>
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
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController,
  loadingController
} from '@ionic/vue'
import { camera, closeCircle } from 'ionicons/icons'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { PropositionService } from '@/services/proposition-service'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import {
  getUserContact,
  saveUserContact,
  getCityIdFromDatabase
} from '@/utils/storage'
import { getOrCreateUserId } from '@/services/push-notifications'

const router = useRouter()

const name = ref('')
const description = ref('')
const photo = ref(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const loading = ref(false)

const isValid = computed(() => {
  return (
    name.value.trim().length > 0 &&
    description.value.trim().length >= 100 &&
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  )
})

onMounted(() => {
  const contact = getUserContact()
  if (contact) {
    firstName.value = contact.firstName || ''
    lastName.value = contact.lastName || ''
    email.value = contact.email || ''
  }
})

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera // Changé de Prompt à Camera pour plus de fiabilité
    })
    photo.value = image.dataUrl
  } catch (error) {
    console.error('Error taking photo:', error)
    const toast = await toastController.create({
      message: 'Erreur lors de la prise de photo',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

const submitProposition = async () => {
  if (!isValid.value) return

  loading.value = true
  const loadingElement = await loadingController.create({
    message: 'Publication...'
  })
  await loadingElement.present()

  try {
    let photoUrl = null
    if (photo.value) {
      // Convert DataURL to File
      const response = await fetch(photo.value)
      const blob = await response.blob()

      // Déterminer l'extension et le type MIME à partir du blob
      let extension = 'jpg'
      let mimeType = 'image/jpeg'

      if (blob.type) {
        mimeType = blob.type
        if (blob.type === 'image/png') {
          extension = 'png'
        } else if (blob.type === 'image/webp') {
          extension = 'webp'
        } else if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') {
          extension = 'jpg'
          mimeType = 'image/jpeg'
        }
      }

      const file = new File([blob], `proposition.${extension}`, {
        type: mimeType
      })
      photoUrl = await uploadImageToCloudinary(file)
    }

    const communeId = await getCityIdFromDatabase()
    const userId = getOrCreateUserId()

    if (!communeId) {
      throw new Error('Commune non identifiée')
    }

    const propositionData = {
      commune_id: communeId,
      user_id: userId,
      name: name.value.trim(),
      description: description.value.trim(),
      photo_url: photoUrl || null,
      user_firstname: firstName.value.trim(),
      user_lastname: lastName.value.trim(),
      user_email: email.value.trim(),
      votes_count: 0,
      is_archived: false
    }

    const { data: insertData, error: insertError } = await PropositionService.create(propositionData)

    if (insertError) {
      console.error('Proposition create error:', insertError)
      throw insertError
    }

    // Sauvegarder les contacts pour la prochaine fois
    saveUserContact({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim()
    })

    const toast = await toastController.create({
      message: 'Votre doléance a été publiée !',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/propositions')
  } catch (error) {
    console.error('Error submitting proposition:', error)
    const toast = await toastController.create({
      message: 'Erreur lors de la publication : ' + error.message,
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
    await loadingElement.dismiss()
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--ion-color-dark);
}

.section-subtitle {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.form-item {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  margin-bottom: 12px;
  --padding-start: 12px;
}

.char-counter {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-align: right;
  padding: 4px 8px;

  &.error {
    color: var(--ion-color-danger);
  }
}

.photo-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;

  .photo-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-photo-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    --color: white;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin: 0;
  }
}

.submit-section {
  margin-top: 32px;
  margin-bottom: 40px;
}

.submit-button {
  --border-radius: 12px;
  height: 54px;
  font-weight: 600;
}
</style>
