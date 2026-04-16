<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <template v-slot:start>
          <ion-buttons>
            <ion-back-button
              default-href="/tabs/signalements"
            ></ion-back-button>
          </ion-buttons>
        </template>
        <ion-title>Détail du signalement</ion-title>
        <template v-slot:end>
          <ion-buttons>
            <ion-button
              @click="toggleEditMode"
              v-if="!isArchiving"
              color="light"
            >
              <ion-icon :icon="isEditing ? close : create" />
            </ion-button>
          </ion-buttons>
        </template>
      </ion-toolbar>
    </ion-header>
    <ion-content class="detail-content">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement...</p>
      </div>

      <div v-else-if="signalement" class="detail-container">
        <!-- Mode affichage -->
        <div v-if="!isEditing" class="view-mode">
          <!-- Photo -->
          <div v-if="signalement.photo_url" class="photo-section">
            <img
              :src="signalement.photo_url"
              alt="Photo du signalement"
              class="detail-photo"
            />
            <p v-if="signalement.comment" class="photo-comment">
              {{ signalement.comment }}
            </p>
          </div>

          <!-- Informations principales -->
          <ion-card class="info-card">
            <ion-card-header>
              <div class="card-header-row">
                <ion-card-title>Description</ion-card-title>
                <ion-badge :color="getStatusColor(signalement.status)">
                  {{ getStatusLabel(signalement.status) }}
                </ion-badge>
              </div>
            </ion-card-header>
            <ion-card-content>
              <p class="description-text">
                {{ signalement.description || 'Aucune description' }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Réponse de l'administration -->
          <ion-card v-if="signalement.reponse" class="info-card response-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="checkmarkCircle" /> Réponse de la mairie
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p class="response-text">{{ signalement.reponse }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Localisation -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="locationIcon" /> Localisation
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div v-if="signalement.latitude && signalement.longitude">
                <p><strong>Coordonnées GPS :</strong></p>
                <p>
                  {{ signalement.latitude.toFixed(6) }},
                  {{ signalement.longitude.toFixed(6) }}
                </p>
                <p v-if="signalement.location_accuracy" class="accuracy-text">
                  Précision : {{ Math.round(signalement.location_accuracy) }}m
                </p>
              </div>
              <div v-if="signalement.address || addressFromGps">
                <p><strong>Adresse :</strong></p>
                <p>{{ signalement.address || addressFromGps }}</p>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Coordonnées du déclarant -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="person" /> Coordonnées
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p>
                <strong>Nom :</strong> {{ signalement.first_name }}
                {{ signalement.last_name }}
              </p>
              <p v-if="signalement.email">
                <strong>Email :</strong> {{ signalement.email }}
              </p>
              <p v-if="signalement.phone">
                <strong>Téléphone :</strong> {{ signalement.phone }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Boutons d'action -->
          <div class="action-buttons" v-if="signalement.status !== 'archive'">
            <ion-button
              expand="block"
              color="medium"
              @click="confirmArchive"
              :disabled="isArchiving"
            >
              <template v-slot:start>
                <ion-icon :icon="archive" />
              </template>
              Archiver le signalement
            </ion-button>
          </div>
        </div>

        <!-- Mode édition -->
        <div v-else class="edit-mode">
          <div class="edit-header">
            <h2 class="edit-title">Modifier le signalement</h2>
            <p class="edit-subtitle">
              Modifiez les informations de votre signalement
            </p>
          </div>
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">Description</h3>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked" class="label-with-icon">
                  <ion-icon :icon="createOutline" class="edit-icon" />
                  Description du signalement
                </ion-label>
                <ion-textarea
                  shape="round"
                  mode="ios"
                  fill="outline"
                  class="custom"
                  v-model="editForm.description"
                  placeholder="Décrivez le signalement..."
                  rows="4"
                ></ion-textarea>
              </ion-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">Photo</h3>
              <ion-button
                expand="block"
                @click="takePhoto"
                :disabled="saving"
                class="photo-button"
              >
                <template v-slot:start>
                  <ion-icon :icon="camera" />
                </template>
                {{ editPhoto ? 'Reprendre la photo' : 'Prendre une photo' }}
              </ion-button>

              <div v-if="editPhoto" class="photo-preview">
                <img :src="editPhoto" alt="Photo du signalement" />
                <ion-button
                  fill="clear"
                  @click="removePhoto"
                  class="remove-photo-btn"
                  :disabled="saving"
                >
                  <ion-icon :icon="close" />
                </ion-button>
              </div>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked" class="label-with-icon">
                  <ion-icon :icon="createOutline" class="edit-icon" />
                  Commentaire
                </ion-label>
                <ion-textarea
                  shape="round"
                  mode="ios"
                  fill="outline"
                  class="custom"
                  v-model="editForm.comment"
                  placeholder="Commentaire sur la photo (optionnel)..."
                  rows="3"
                ></ion-textarea>
              </ion-item>
            </div>

            <div class="action-buttons">
              <ion-button
                expand="block"
                @click="saveChanges"
                :disabled="saving"
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
        <h3>Signalement introuvable</h3>
        <ion-button expand="block" @click="$router.push('/tabs/signalements')">
          Retour à la liste
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
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
  // IonInput, // Unused
  // IonSelect, // Unused
  // IonSelectOption, // Unused
  IonSpinner,
  loadingController,
  toastController,
  alertController
} from '@ionic/vue'
import {
  create,
  close,
  // trash, // Unused
  checkmark,
  checkmarkCircle,
  archive,
  location as locationIcon,
  person,
  alertCircle,
  camera,
  createOutline
} from 'ionicons/icons'
import { SignalementService } from '@/services/signalement-service'
import { trackEvent } from '@/services/posthog'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import { useGeocoding } from '@/composables/useGeocoding'
import { getErrorMessage } from '@/utils/error-message'

const route = useRoute()
const router = useRouter() // eslint-disable-line no-unused-vars

const signalement = ref(null)
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const isArchiving = ref(false)

const editForm = ref({
  description: '',
  comment: '',
  status: ''
})

const editPhoto = ref(null)
const photoChanged = ref(false)

const addressFromGps = ref('')

const { getAddressFromCoordinates } = useGeocoding()

const loadSignalement = async () => {
  loading.value = true
  try {
    const { data, error } = await SignalementService.getById(route.params.id)

    if (error) throw error

    signalement.value = data

    // Si pas d'adresse mais coordonnées GPS, on essaie de récupérer l'adresse
    if (!data.address && data.latitude && data.longitude) {
      addressFromGps.value = await getAddressFromCoordinates(
        data.latitude,
        data.longitude
      )
    }

    // Initialiser le formulaire d'édition
    editForm.value = {
      description: data.description || '',
      comment: data.comment || '',
      status: data.status || 'en_attente'
    }
    editPhoto.value = data.photo_url || null
    photoChanged.value = false
  } catch (error) {
    console.error('Error loading signalement:', error)
    const toast = await toastController.create({
      message: 'Erreur lors du chargement du signalement',
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
  if (isEditing.value && signalement.value) {
    // Track edit mode started
    trackEvent('signalement_edit_started', {
      signalement_id: signalement.value.id,
      status: signalement.value.status
    })

    // Réinitialiser le formulaire avec les valeurs actuelles
    editForm.value = {
      description: signalement.value.description || '',
      comment: signalement.value.comment || '',
      status: signalement.value.status || 'en_attente'
    }
    editPhoto.value = signalement.value.photo_url || null
    photoChanged.value = false
  } else if (!isEditing.value) {
    // Track edit cancelled
    trackEvent('signalement_edit_cancelled', {
      signalement_id: signalement.value?.id
    })
  }
}

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    })

    editPhoto.value = image.dataUrl
    photoChanged.value = true

    trackEvent('signalement_photo_changed', {
      signalement_id: signalement.value?.id
    })
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

const removePhoto = () => {
  editPhoto.value = null
  photoChanged.value = true

  trackEvent('signalement_photo_removed', {
    signalement_id: signalement.value?.id
  })
}

const cancelEdit = () => {
  isEditing.value = false
  editPhoto.value = signalement.value?.photo_url || null
  photoChanged.value = false

  // Track edit cancelled
  trackEvent('signalement_edit_cancelled', {
    signalement_id: signalement.value?.id
  })
}

const saveChanges = async () => {
  saving.value = true
  const loadingToast = await loadingController.create({
    message: 'Enregistrement en cours...'
  })
  await loadingToast.present()

  try {
    let photoUrl = signalement.value?.photo_url || null

    // Si la photo a été modifiée, uploader la nouvelle photo
    if (photoChanged.value) {
      if (editPhoto.value) {
        // Convertir dataUrl en File pour Cloudinary
        const response = await fetch(editPhoto.value)
        const blob = await response.blob()

        // Déterminer l'extension et le type MIME
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

        const file = new File(
          [blob],
          `signalement-${route.params.id}.${extension}`,
          { type: mimeType }
        )
        photoUrl = await uploadImageToCloudinary(file)
      } else {
        // Photo supprimée
        photoUrl = null
      }
    }

    const updateData = {
      description: editForm.value.description,
      comment: editForm.value.comment,
      status: editForm.value.status
    }

    // Ajouter la photo seulement si elle a été modifiée
    if (photoChanged.value) {
      updateData.photo_url = photoUrl
    }

    const { data, error } = await SignalementService.update(
      route.params.id,
      updateData
    )

    if (error) throw error

    const wasPhotoChanged = photoChanged.value

    signalement.value = data
    isEditing.value = false
    photoChanged.value = false

    // Track successful modification
    trackEvent('signalement_modified', {
      signalement_id: route.params.id,
      old_status: signalement.value?.status,
      new_status: editForm.value.status,
      fields_modified: {
        description:
          editForm.value.description !== (signalement.value?.description || ''),
        comment: editForm.value.comment !== (signalement.value?.comment || ''),
        photo: wasPhotoChanged,
        status: editForm.value.status !== (signalement.value?.status || '')
      }
    })

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Modifications enregistrées avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Error updating signalement:', error)
    await loadingToast.dismiss()

    // Track modification error
    trackEvent('signalement_modification_error', {
      signalement_id: route.params.id,
      error: getErrorMessage(error, 'Unknown error'),
      error_code: error.code || null
    })

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

const confirmArchive = async () => {
  const alert = await alertController.create({
    header: "Confirmer l'archivage",
    message:
      'Êtes-vous sûr de vouloir archiver ce signalement ? Il sera déplacé dans les archives.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Archiver',
        handler: () => {
          archiveSignalement()
        }
      }
    ]
  })

  await alert.present()
}

const archiveSignalement = async () => {
  isArchiving.value = true
  const loadingToast = await loadingController.create({
    message: 'Archivage en cours...'
  })
  await loadingToast.present()

  try {
    // Sauvegarder le statut précédent pour le tracking
    const previousStatus = signalement.value?.status || 'unknown'

    console.log(
      'Archiving signalement:',
      route.params.id,
      'Previous status:',
      previousStatus
    )

    const { data, error } = await SignalementService.archive(route.params.id)

    console.log('Update result:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update')
      throw new Error(
        'Signalement non trouvé ou non autorisé à être mis à jour'
      )
    }

    // Mettre à jour le signalement local
    signalement.value = data[0]

    // Track successful archiving
    trackEvent('signalement_archived', {
      signalement_id: route.params.id,
      previous_status: previousStatus
    })

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Signalement archivé avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    // Recharger le signalement pour mettre à jour l'affichage
    await loadSignalement()
  } catch (error) {
    console.error('Error archiving signalement:', error)
    await loadingToast.dismiss()

    // Track archiving error
    trackEvent('signalement_archiving_error', {
      signalement_id: route.params.id,
      error: getErrorMessage(error, 'Unknown error'),
      error_code: error.code || null
    })

    const toast = await toastController.create({
      message: "Erreur lors de l'archivage",
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    isArchiving.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'traite':
      return 'success'
    case 'en_cours':
      return 'warning'
    case 'archive':
      return 'medium'
    case 'en_attente':
    default:
      return 'medium'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'traite':
      return 'Traité'
    case 'en_cours':
      return 'En cours'
    case 'archive':
      return 'Archivé'
    case 'en_attente':
    default:
      return 'En Attente'
  }
}

onMounted(() => {
  loadSignalement()

  // Track signalement detail view
  trackEvent('signalement_detail_viewed', {
    signalement_id: route.params.id
  })
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

.edit-header {
  background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 16px;
  margin-top: 16px;
  padding: 4px 0;
  text-align: center;
}

.edit-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin: 0 0 8px 0;
}

.edit-subtitle {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}

.photo-section {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-photo {
  width: 100%;
  height: auto;
  display: block;
}

.photo-comment {
  margin-top: 12px;
  padding: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
  font-style: italic;
  color: var(--ion-color-medium);
  white-space: pre-wrap;
  line-height: 1.5;
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

.comment-text {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ion-color-light);
  font-style: italic;
  color: var(--ion-color-medium);
}

.response-card {
  background: var(--ion-color-success-tint);
  border-left: 4px solid var(--ion-color-success);
}

.response-text {
  color: var(--ion-color-dark);
  line-height: 1.6;
  white-space: pre-wrap;
}

.accuracy-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
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
  // Styles for form sections can be added here if needed
}

.detail-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
