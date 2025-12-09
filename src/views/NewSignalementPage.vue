<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Nouveau signalement</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
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
            <h4 class="location-title">Localisation</h4>
            <div v-if="hasCityInfo" class="city-info-container">
              <p class="city-info-badge">
                <ion-icon :icon="checkmarkCircleOutline" />
                Commune : {{ cityInfo.name }} ({{ cityInfo.postalCode }})
              </p>
              <ion-button 
                fill="clear" 
                size="small" 
                @click="openCityModal"
                class="change-city-button"
              >
                <ion-icon :icon="createOutline" slot="start" />
                Changer de commune
              </ion-button>
            </div>
            <ion-button 
              expand="block" 
              @click="getCurrentLocation" 
              :disabled="loading || gettingLocation"
              fill="outline"
              class="location-button"
            >
              <ion-icon :icon="locationIcon" slot="start" />
              {{ location ? 'Position GPS enregistrée' : 'Obtenir ma position GPS' }}
            </ion-button>
            <p v-if="location" class="location-info">
              <ion-icon :icon="checkmarkCircleOutline" />
              Position enregistrée : {{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}
            </p>
            <p v-if="locationError" class="location-error">
              <ion-icon :icon="alertCircleOutline" />
              {{ locationError }}
            </p>
            
            <div v-if="locationError || useAddress" class="address-fallback">
              <p class="fallback-text">Ou renseignez l'adresse manuellement :</p>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Adresse</ion-label>
                <ion-input
                  v-model="address"
                  placeholder="Adresse où se trouve le signalement"
                ></ion-input>
              </ion-item>
            </div>
            
            <ion-button 
              v-if="!locationError && !useAddress"
              expand="block" 
              @click="useAddress = true"
              fill="clear"
              size="small"
              class="use-address-button"
            >
              Utiliser une adresse à la place
            </ion-button>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Photo</h3>
          <ion-button expand="block" @click="takePhoto" :disabled="loading" class="photo-button">
            <ion-icon :icon="camera" slot="start" />
            {{ photo ? 'Reprendre la photo' : 'Prendre une photo' }}
          </ion-button>

          <div v-if="photo" class="photo-preview">
            <img :src="photo" alt="Photo du signalement" />
            <ion-button fill="clear" @click="removePhoto" class="remove-photo-btn">
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
          <p class="section-subtitle">Ces informations nous permettront de vous contacter si nécessaire</p>
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
                <ion-label position="stacked">Email</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
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
          :disabled="loading || !photo || !lastName || !firstName || (!location && !address)"
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonTextarea, IonInput, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, loadingController, toastController } from '@ionic/vue'
import { camera, checkmark, close, location as locationIcon, checkmarkCircleOutline, alertCircleOutline, createOutline } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import { saveUserContact, getUserContact, getCityInfo, getCityIdFromDatabase } from '@/utils/storage'
import CitySetupModal from '@/components/CitySetupModal.vue'

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

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
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

const removePhoto = () => {
  photo.value = null
}

const getCurrentLocation = async () => {
  gettingLocation.value = true
  locationError.value = ''
  useAddress.value = false // Réinitialiser le mode adresse si on essaie le GPS

  try {
    // Demander la permission
    const permissionStatus = await Geolocation.checkPermissions()
    
    if (permissionStatus.location !== 'granted') {
      const requestResult = await Geolocation.requestPermissions()
      if (requestResult.location !== 'granted') {
        locationError.value = 'Permission de géolocalisation refusée. Vous pouvez utiliser une adresse à la place.'
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

    // Réinitialiser l'adresse si le GPS fonctionne
    address.value = ''
    useAddress.value = false

    const toast = await toastController.create({
      message: 'Position GPS enregistrée avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Error getting location:', error)
    locationError.value = 'Impossible d\'obtenir votre position. Vous pouvez utiliser une adresse à la place.'
    useAddress.value = true // Activer le mode adresse en fallback
    
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

// Charger les coordonnées sauvegardées et obtenir la position GPS au chargement de la page
onMounted(async () => {
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
    if (!address.value || (oldCityName && address.value.includes(oldCityName))) {
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

  if (!email.value && !phone.value) {
    const toast = await toastController.create({
      message: 'Veuillez renseigner au moins un email ou un téléphone',
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
    const file = new File([blob], 'signalement.jpg', { type: 'image/jpeg' })

    // Upload vers Cloudinary
    const photoUrl = await uploadImageToCloudinary(file)

    // Récupérer l'ID de la commune
    const cityId = await getCityIdFromDatabase()

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

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('signalements')
      .insert([dataToInsert])
      .select()

    if (error) throw error

    // Sauvegarder les coordonnées dans le localStorage pour les prochaines fois
    saveUserContact({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      address: address.value
    })

    await loadingToast.dismiss()

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

    // Afficher un message d'erreur plus détaillé
    const errorMessage = error.message || 'Erreur lors de l\'envoi'
    
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

<style scoped>
.form-container {
  padding: 16px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
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
}

.photo-button {
  margin-bottom: 16px;
}

.photo-preview {
  position: relative;
  margin: 16px 0;
  text-align: center;
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
}

.photo-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remove-photo-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  --color: var(--ion-color-danger);
}

.submit-button {
  margin-top: 24px;
  height: 48px;
  font-weight: 600;
}

.location-section {
  margin-top: 16px;
}

.location-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 12px 0;
}

.location-button {
  margin-bottom: 12px;
}

.use-address-button {
  margin-top: 8px;
  --color: var(--ion-color-medium);
  font-size: 14px;
}

.address-fallback {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.fallback-text {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-success);
  font-size: 14px;
  margin: 8px 0 0 0;
  padding: 8px 12px;
  background: rgba(var(--ion-color-success-rgb), 0.1);
  border-radius: 8px;
}

.location-info ion-icon {
  font-size: 18px;
}

.location-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-danger);
  font-size: 14px;
  margin: 8px 0 0 0;
  padding: 8px 12px;
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  border-radius: 8px;
}

.location-error ion-icon {
  font-size: 18px;
}

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
}

.saved-contact-info ion-icon {
  font-size: 18px;
}

.city-info-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.city-info-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-primary);
  font-size: 14px;
  margin: 0;
  padding: 8px 12px;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 8px;
  font-weight: 500;
  flex: 1;
  min-width: 200px;
}

.city-info-badge ion-icon {
  font-size: 18px;
}

.change-city-button {
  --color: var(--ion-color-primary);
  font-size: 13px;
  margin: 0;
  height: auto;
  text-transform: none;
}

.change-city-button ion-icon {
  font-size: 16px;
}
</style>

