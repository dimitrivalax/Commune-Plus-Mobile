<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Paramètres</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="ion-padding">
        <!-- Section Coordonnées utilisateur -->
        <div class="settings-section">
          <h2 class="section-title">
            <ion-icon :icon="person" />
            Mes coordonnées
          </h2>
          <ion-card>
            <ion-card-content>
              <form @submit.prevent="saveUserContact">
                <ion-item>
                  <ion-label position="stacked">Prénom</ion-label>
                  <ion-input
                    v-model="userForm.firstName"
                    type="text"
                    placeholder="Votre prénom"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Nom</ion-label>
                  <ion-input
                    v-model="userForm.lastName"
                    type="text"
                    placeholder="Votre nom"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input
                    v-model="userForm.email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Téléphone</ion-label>
                  <ion-input
                    v-model="userForm.phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Adresse</ion-label>
                  <ion-input
                    v-model="userForm.address"
                    type="text"
                    placeholder="Votre adresse (optionnel)"
                  ></ion-input>
                </ion-item>

                <ion-button
                  expand="block"
                  type="submit"
                  :disabled="isSavingUser"
                  class="save-button"
                >
                  <ion-spinner v-if="isSavingUser" name="crescent"></ion-spinner>
                  <span v-else>Enregistrer mes coordonnées</span>
                </ion-button>
              </form>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Section Informations de la commune -->
        <div class="settings-section">
          <h2 class="section-title">
            <ion-icon :icon="location" />
            Informations de la commune
          </h2>
          <ion-card>
            <ion-card-content>
              <div v-if="!hasCityInfo" class="no-city-info">
                <p>Aucune commune configurée</p>
                <ion-button expand="block" @click="openCityModal" fill="outline">
                  Configurer la commune
                </ion-button>
              </div>

              <div v-else>
                <div class="city-info-display">
                  <ion-item>
                    <ion-label>
                      <h3>Nom de la commune</h3>
                      <p>{{ cityInfo.name }}</p>
                    </ion-label>
                  </ion-item>

                  <ion-item>
                    <ion-label>
                      <h3>Code postal</h3>
                      <p>{{ cityInfo.postalCode }}</p>
                    </ion-label>
                  </ion-item>

                  <ion-item>
                    <ion-label>
                      <h3>Email</h3>
                      <p>{{ cityInfo.email }}</p>
                    </ion-label>
                  </ion-item>
                </div>

                <ion-button
                  expand="block"
                  @click="openCityModal"
                  fill="outline"
                  class="edit-button"
                >
                  <ion-icon :icon="create" slot="start" />
                  Modifier les informations de la commune
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Modale de configuration de la commune -->
      <CitySetupModal 
        :is-open="showCityModal" 
        @saved="handleCityInfoSaved"
        @close="showCityModal = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  toastController
} from '@ionic/vue'
import { person, location, create } from 'ionicons/icons'
import { saveUserContact, getUserContact, getCityInfo } from '@/utils/storage'
import CitySetupModal from '@/components/CitySetupModal.vue'

const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: ''
})

const cityInfo = ref(null)
const hasCityInfo = ref(false)
const isSavingUser = ref(false)
const showCityModal = ref(false)

const loadData = () => {
  // Charger les coordonnées utilisateur
  const savedContact = getUserContact()
  if (savedContact) {
    userForm.value = {
      firstName: savedContact.firstName || '',
      lastName: savedContact.lastName || '',
      email: savedContact.email || '',
      phone: savedContact.phone || '',
      address: savedContact.address || ''
    }
  }

  // Charger les informations de la commune
  const savedCityInfo = getCityInfo()
  if (savedCityInfo && savedCityInfo.name) {
    hasCityInfo.value = true
    cityInfo.value = savedCityInfo
  } else {
    hasCityInfo.value = false
    cityInfo.value = null
  }
}

const saveUserContactForm = async () => {
  isSavingUser.value = true

  try {
    saveUserContact({
      firstName: userForm.value.firstName.trim(),
      lastName: userForm.value.lastName.trim(),
      email: userForm.value.email.trim(),
      phone: userForm.value.phone.trim(),
      address: userForm.value.address.trim()
    })

    const toast = await toastController.create({
      message: 'Coordonnées enregistrées avec succès',
      duration: 2000,
      color: 'success',
      position: 'top'
    })
    await toast.present()
  } catch (error) {
    console.error('Error saving user contact:', error)
    const toast = await toastController.create({
      message: 'Erreur lors de l\'enregistrement',
      duration: 2000,
      color: 'danger',
      position: 'top'
    })
    await toast.present()
  } finally {
    isSavingUser.value = false
  }
}

const openCityModal = () => {
  showCityModal.value = true
}

const handleCityInfoSaved = () => {
  showCityModal.value = false
  // Recharger les informations de la commune
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.settings-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 16px 0;
  padding: 0 4px;
}

.section-title ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

ion-card {
  margin: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-item:last-child {
  margin-bottom: 0;
}

.save-button,
.edit-button {
  margin-top: 16px;
}

.no-city-info {
  text-align: center;
  padding: 24px 0;
}

.no-city-info p {
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.city-info-display {
  margin-bottom: 16px;
}

.city-info-display ion-item {
  --background: var(--ion-color-light);
  --border-radius: 8px;
  margin-bottom: 12px;
  padding: 12px 0;
}

.city-info-display h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 4px 0;
}

.city-info-display p {
  font-size: 16px;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>



