<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau signalement</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar color="primary">
          <ion-title size="large">Nouveau signalement</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="form-container">
        <div class="form-section">
          <h3 class="section-title">Description</h3>
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Description du signalement</ion-label>
            <ion-textarea
              v-model="description"
              placeholder="Décrivez le signalement..."
              rows="4"
            ></ion-textarea>
          </ion-item>

          <div class="location-section">
            <ion-button
              expand="block"
              @click="getCurrentLocation"
              :disabled="loading || gettingLocation"
              fill="outline"
              class="location-button"
            >
              <ion-icon :icon="locationIcon" slot="start" />
              {{
                location
                  ? 'Position GPS enregistrée'
                  : 'Obtenir ma position GPS'
              }}
            </ion-button>
            <p v-if="location" class="location-info">
              <ion-icon :icon="checkmarkCircleOutline" />
              Position enregistrée : {{ location.latitude.toFixed(6) }},
              {{ location.longitude.toFixed(6) }}
              <span v-if="addressFromGps" class="address-gps">
                {{ addressFromGps }}
              </span>
            </p>
            <p v-if="locationError" class="location-error">
              <ion-icon :icon="alertCircleOutline" />
              {{ locationError }}
            </p>

            <div v-if="locationError || useAddress" class="address-fallback">
              <p class="fallback-text">
                Ou renseignez l'adresse manuellement :
              </p>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Adresse</ion-label>
                <ion-input
                  v-model="address"
                  placeholder="Adresse où se trouve le signalement"
                ></ion-input>
              </ion-item>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Photo</h3>
          <ion-button
            expand="block"
            @click="takePhoto"
            :disabled="loading"
            class="photo-button"
          >
            <ion-icon :icon="camera" slot="start" />
            {{ photo ? 'Reprendre la photo' : 'Prendre une photo' }}
          </ion-button>

          <div v-if="photo" class="photo-preview">
            <img :src="photo" alt="Photo du signalement" />
            <ion-button
              fill="clear"
              @click="removePhoto"
              class="remove-photo-btn"
            >
              <ion-icon :icon="close" />
            </ion-button>
          </div>

          <ion-item v-if="photo" lines="none" class="form-item">
            <ion-label position="stacked">Commentaire sur la photo</ion-label>
            <ion-textarea
              v-model="comment"
              placeholder="Ajoutez un commentaire sur cette photo (optionnel)..."
              rows="3"
            ></ion-textarea>
          </ion-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">Vos coordonnées</h3>
          <p class="section-subtitle">
            Ces informations nous permettront de vous contacter si nécessaire
          </p>
          <p v-if="hasSavedContact" class="saved-contact-info">
            <ion-icon :icon="checkmarkCircleOutline" />
            Coordonnées pré-remplies depuis votre dernière utilisation
          </p>

          <ion-card class="contact-card">
            <ion-card-content>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Nom *</ion-label>
                <ion-input
                  v-model="lastName"
                  placeholder="Votre nom"
                  required
                ></ion-input>
              </ion-item>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Prénom *</ion-label>
                <ion-input
                  v-model="firstName"
                  placeholder="Votre prénom"
                  required
                ></ion-input>
              </ion-item>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Email *</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  required
                ></ion-input>
              </ion-item>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Téléphone</ion-label>
                <ion-input
                  v-model="phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                ></ion-input>
              </ion-item>
            </ion-card-content>
          </ion-card>
        </div>

        <ion-button
          expand="block"
          @click="submitSignalement"
          :disabled="
            loading ||
            !photo ||
            !lastName ||
            !firstName ||
            !email ||
            (!location && !address)
          "
          class="submit-button"
        >
          <ion-icon :icon="checkmark" slot="start" />
          Envoyer le signalement
        </ion-button>
      </div>
    </ion-content>

    <!-- Modale de configuration de la commune -->
    <CitySetupModal
      :is-open="showCityModal"
      @saved="handleCityInfoSaved"
      @close="showCityModal = false"
    />
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'
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
  IonTextarea,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  loadingController,
  toastController
} from '@ionic/vue'
import {
  camera,
  checkmark,
  close,
  location as locationIcon,
  checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { SignalementService } from '@/services/signalement-service'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import {
  saveUserContact,
  getUserContact,
  getCityInfo,
  getCityIdFromDatabase
} from '@/utils/storage'
import { sendSignalementEmail } from '@/services/email'
import CitySetupModal from '@/components/city-setup-modal.vue'
import { trackEvent } from '@/services/posthog'
import { useGeocoding } from '@/composables/useGeocoding'
import {
  getOrCreateUserId,
  updatePushTokenEmail
} from '@/services/push-notifications'

const router = useRouter()
const description = ref('')
const location = ref(null)
const locationError = ref('')
const gettingLocation = ref(false)
const useAddress = ref(false)
const address = ref('')
const comment = ref('')
const photo = ref(null)
const lastName = ref('')
const firstName = ref('')
const email = ref('')
const phone = ref('')
const loading = ref(false)
const hasSavedContact = ref(false)
const hasCityInfo = ref(false)
const cityInfo = ref(null)
const showCityModal = ref(false)

const { getAddressFromCoordinates } = useGeocoding()

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    })

    photo.value = image.dataUrl

    // Track photo taken event
    trackEvent('signalement_photo_taken', {
      has_photo: true
    })
  } catch (error) {
    console.error('Error taking photo:', error)

    // Track photo error
    trackEvent('signalement_photo_error', {
      error: error.message || 'Unknown error'
    })

    const toast = await toastController.create({
      message: 'Erreur lors de la prise de photo',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

const removePhoto = () => {
  photo.value = null

  // Track photo removed event
  trackEvent('signalement_photo_removed')
}

const addressFromGps = ref('')

const getCurrentLocation = async () => {
  gettingLocation.value = true
  locationError.value = ''
  useAddress.value = false // Réinitialiser le mode adresse si on essaie le GPS
  addressFromGps.value = ''

  try {
    // Vérifier si on est sur le web
    const isWeb = Capacitor.getPlatform() === 'web'

    if (isWeb) {
      // Utiliser l'API géolocalisation native du navigateur
      if (!navigator.geolocation) {
        locationError.value =
          "La géolocalisation n'est pas supportée par votre navigateur. Vous pouvez utiliser une adresse à la place."
        useAddress.value = true
        gettingLocation.value = false
        return
      }

      // Obtenir la position avec l'API du navigateur
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }

      // Réinitialiser l'adresse manuelle si le GPS fonctionne
      address.value = ''
      useAddress.value = false

      // Obtenir l'adresse depuis les coordonnées
      addressFromGps.value = await getAddressFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      )

      // Track GPS location obtained
      trackEvent('signalement_location_gps_obtained', {
        accuracy: position.coords.accuracy,
        has_location: true,
        platform: 'web'
      })

      const toast = await toastController.create({
        message: 'Position GPS enregistrée avec succès',
        duration: 2000,
        color: 'success'
      })
      await toast.present()
    } else {
      // Utiliser Capacitor Geolocation pour mobile
      // Demander la permission
      const permissionStatus = await Geolocation.checkPermissions()

      if (permissionStatus.location !== 'granted') {
        const requestResult = await Geolocation.requestPermissions()
        if (requestResult.location !== 'granted') {
          locationError.value =
            'Permission de géolocalisation refusée. Vous pouvez utiliser une adresse à la place.'
          useAddress.value = true // Activer le mode adresse en fallback
          gettingLocation.value = false
          return
        }
      }

      // Obtenir la position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })

      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }

      // Réinitialiser l'adresse manuelle si le GPS fonctionne
      address.value = ''
      useAddress.value = false

      // Obtenir l'adresse depuis les coordonnées
      addressFromGps.value = await getAddressFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      )

      // Track GPS location obtained
      trackEvent('signalement_location_gps_obtained', {
        accuracy: position.coords.accuracy,
        has_location: true,
        platform: Capacitor.getPlatform()
      })

      const toast = await toastController.create({
        message: 'Position GPS enregistrée avec succès',
        duration: 2000,
        color: 'success'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Error getting location:', error)

    // Message d'erreur adapté selon le type d'erreur
    if (error.code === 1) {
      // PERMISSION_DENIED
      locationError.value =
        'Permission de géolocalisation refusée. Vous pouvez utiliser une adresse à la place.'
    } else if (error.code === 2) {
      // POSITION_UNAVAILABLE
      locationError.value =
        'Position indisponible. Vous pouvez utiliser une adresse à la place.'
    } else if (error.code === 3) {
      // TIMEOUT
      locationError.value =
        'Timeout lors de la récupération de la position. Vous pouvez utiliser une adresse à la place.'
    } else {
      locationError.value =
        "Impossible d'obtenir votre position. Vous pouvez utiliser une adresse à la place."
    }

    useAddress.value = true // Activer le mode adresse en fallback

    // Track GPS error
    trackEvent('signalement_location_gps_error', {
      error: error.message || 'Unknown error',
      error_code: error.code || null,
      fallback_to_address: true,
      platform: Capacitor.getPlatform()
    })

    const toast = await toastController.create({
      message: 'Erreur lors de la récupération de la position GPS',
      duration: 3000,
      color: 'warning'
    })
    await toast.present()
  } finally {
    gettingLocation.value = false
  }
}

const handleUseAddress = () => {
  useAddress.value = true

  // Track manual address selection
  trackEvent('signalement_location_address_selected', {
    location_type: 'address',
    gps_available: !!location.value
  })
}

// Charger les coordonnées sauvegardées et obtenir la position GPS au chargement de la page
onMounted(async () => {
  // Track signalement creation started
  trackEvent('signalement_creation_started')

  // Charger les coordonnées depuis le localStorage
  const savedContact = getUserContact()
  if (savedContact) {
    hasSavedContact.value = true
    firstName.value = savedContact.firstName
    lastName.value = savedContact.lastName
    email.value = savedContact.email
    phone.value = savedContact.phone
    if (savedContact.address) {
      address.value = savedContact.address
      useAddress.value = true
    }
  }

  // Charger les informations de la commune et préremplir l'adresse si nécessaire
  const savedCityInfo = getCityInfo()
  if (savedCityInfo && savedCityInfo.name && savedCityInfo.postalCode) {
    hasCityInfo.value = true
    cityInfo.value = savedCityInfo
    // Si l'adresse n'est pas déjà remplie, préremplir avec les informations de la commune
    if (!address.value) {
      address.value = `${savedCityInfo.name}, ${savedCityInfo.postalCode}`
    }
  }

  // Essayer d'obtenir la position GPS automatiquement
  try {
    await getCurrentLocation()
  } catch (error) {
    // Si le GPS échoue, le mode adresse sera activé automatiquement
    console.log('GPS non disponible, mode adresse activé')
  }
})

const openCityModal = () => {
  showCityModal.value = true
}

const handleCityInfoSaved = () => {
  showCityModal.value = false
  // Recharger les informations de la commune
  const savedCityInfo = getCityInfo()
  if (savedCityInfo && savedCityInfo.name && savedCityInfo.postalCode) {
    hasCityInfo.value = true
    const oldCityName = cityInfo.value?.name
    cityInfo.value = savedCityInfo
    // Mettre à jour l'adresse si elle était préremplie avec l'ancienne commune ou si elle est vide
    if (
      !address.value ||
      (oldCityName && address.value.includes(oldCityName))
    ) {
      address.value = `${savedCityInfo.name}, ${savedCityInfo.postalCode}`
    }
  }
}

const submitSignalement = async () => {
  if (!photo.value) {
    const toast = await toastController.create({
      message: 'Veuillez prendre une photo',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  if (!lastName.value || !firstName.value) {
    const toast = await toastController.create({
      message: 'Veuillez renseigner votre nom et prénom',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  if (!email.value?.trim()) {
    const toast = await toastController.create({
      message: 'Veuillez renseigner votre email',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  if (!location.value && !address.value) {
    const toast = await toastController.create({
      message: 'Veuillez obtenir votre position GPS ou renseigner une adresse',
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
    // Convertir dataUrl en File pour Cloudinary
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

    const file = new File([blob], `signalement.${extension}`, {
      type: mimeType
    })

    // Upload vers Cloudinary
    const photoUrl = await uploadImageToCloudinary(file)

    // Récupérer l'ID de la commune
    const cityId = await getCityIdFromDatabase()

    // Récupérer ou créer l'ID utilisateur pour les notifications push
    const userId = getOrCreateUserId()

    // Préparer les données à sauvegarder
    const dataToInsert = {
      description: description.value,
      comment: comment.value,
      photo_url: photoUrl,
      last_name: lastName.value,
      first_name: firstName.value,
      email: email.value || null,
      phone: phone.value || null,
      status: 'en_attente'
    }

    // Ajouter l'ID utilisateur pour les notifications
    // NOTE: La migration SQL doit être exécutée dans Supabase pour que cette colonne existe
    // Si la colonne n'existe pas encore, l'insertion échouera avec une erreur PGRST204
    // Dans ce cas, on réessaiera sans user_id
    dataToInsert.user_id = userId

    // Ajouter l'ID de la commune si disponible
    if (cityId) {
      dataToInsert.city_id = cityId
    }

    // Ajouter soit les coordonnées GPS soit l'adresse
    if (location.value) {
      dataToInsert.latitude = location.value.latitude
      dataToInsert.longitude = location.value.longitude
      dataToInsert.location_accuracy = location.value.accuracy
    } else if (address.value) {
      dataToInsert.address = address.value
    }

    // Sauvegarder via le service
    const { data, error } = await SignalementService.create(dataToInsert)
    if (error) throw error

    // Sauvegarder les coordonnées dans le localStorage pour les prochaines fois
    saveUserContact({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      address: address.value
    })

    if (email.value?.trim()) {
      await updatePushTokenEmail(email.value.trim())
    }

    // Envoyer l'email à la mairie si l'email de la mairie est configuré
    const cityInfoData = getCityInfo()
    if (cityInfoData && cityInfoData.email) {
      try {
        await sendSignalementEmail({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value || null, // null si pas d'email utilisateur
          commune: cityInfoData.name || '',
          description: description.value,
          photoUrl: photoUrl,
          address: address.value || addressFromGps.value || null,
          latitude: location.value?.latitude,
          longitude: location.value?.longitude,
          mairieEmail: cityInfoData.email
        })
        console.log('Email envoyé avec succès à la mairie')
      } catch (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError)
        // Ne pas bloquer le processus si l'email échoue, le signalement est déjà sauvegardé
      }
    } else {
      console.warn(
        "Email de la mairie non configuré, l'email n'a pas été envoyé"
      )
    }

    await loadingToast.dismiss()

    // Track successful signalement submission
    trackEvent('signalement_submitted', {
      signalement_id: data[0]?.id,
      has_photo: !!photoUrl,
      location_type: location.value ? 'gps' : 'address',
      has_email: !!email.value,
      has_phone: !!phone.value,
      city_id: cityId || null
    })

    const toast = await toastController.create({
      message: 'Signalement envoyé avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/signalements')
  } catch (error) {
    console.error('Error submitting signalement:', error)
    await loadingToast.dismiss()

    // Track submission error
    trackEvent('signalement_submission_error', {
      error: error.message || 'Unknown error',
      error_code: error.code || null
    })

    // Afficher un message d'erreur plus détaillé
    const errorMessage = error.message || "Erreur lors de l'envoi"

    const toast = await toastController.create({
      message: errorMessage,
      duration: 4000,
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 16px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 0 4px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--ion-color-medium);
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
  box-shadow: none;
  border-radius: 12px;

  ion-card-content {
    padding: 16px;
  }
}

.location-button,
.photo-button,
.submit-button {
  margin-top: 16px;
  margin-bottom: 16px;
}

.location-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--ion-color-success);
  font-size: 14px;
  margin-top: 8px;
  padding: 0 4px;

  ion-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.address-gps {
  display: block;
  margin-top: 4px;
  font-size: 0.9em;
  opacity: 0.9;
}

.location-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--ion-color-warning);
  font-size: 14px;
  margin-top: 8px;
  padding: 0 4px;

  ion-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.address-fallback {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--ion-color-medium-shade);
}

.fallback-text {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
  font-style: italic;
}

.saved-contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-success);
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: var(--ion-color-success-contrast);
  border-radius: 8px;
  border: 1px solid var(--ion-color-success);

  ion-icon {
    font-size: 16px;
  }
}

.photo-preview {
  position: relative;
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }

  .remove-photo-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    --color: white;
    --background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin: 0;

    ion-icon {
      font-size: 20px;
    }
  }
}
</style>
