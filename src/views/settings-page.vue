<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Paramètres</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="pageContentRef" class="page-content">
      <div class="ion-padding">
        <!-- Section Coordonnées utilisateur -->
        <div class="settings-section">
          <h2 class="section-title">
            <ion-icon :icon="person" />
            Mes coordonnées
          </h2>
          <ion-card>
            <ion-card-content>
              <form @submit.prevent="saveUserContactForm">
                <ion-item lines="none">
                  <ion-label position="stacked">Prénom</ion-label>
                  <ion-input
                    class="custom"
                    shape="round"
                    mode="ios"
                    fill="outline"
                    v-model="userForm.firstName"
                    type="text"
                    placeholder="Votre prénom"
                  ></ion-input>
                </ion-item>

                <ion-item lines="none">
                  <ion-label position="stacked">Nom</ion-label>
                  <ion-input
                    class="custom"
                    shape="round"
                    mode="ios"
                    fill="outline"
                    v-model="userForm.lastName"
                    type="text"
                    placeholder="Votre nom"
                  ></ion-input>
                </ion-item>

                <ion-item lines="none">
                  <ion-label position="stacked">Email</ion-label>
                  <ion-input
                    class="custom"
                    shape="round"
                    mode="ios"
                    fill="outline"
                    v-model="userForm.email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                  ></ion-input>
                </ion-item>

                <ion-item lines="none">
                  <ion-label position="stacked">Téléphone</ion-label>
                  <ion-input
                    class="custom"
                    shape="round"
                    mode="ios"
                    fill="outline"
                    v-model="userForm.phone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                  ></ion-input>
                </ion-item>

                <ion-item lines="none">
                  <ion-label position="stacked">Adresse</ion-label>
                  <ion-input
                    class="custom"
                    shape="round"
                    mode="ios"
                    fill="outline"
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
                  <ion-spinner
                    v-if="isSavingUser"
                    name="crescent"
                  ></ion-spinner>
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
                <ion-button
                  expand="block"
                  @click="openCityModal"
                  fill="outline"
                >
                  Configurer la commune
                </ion-button>
              </div>

              <div v-else>
                <div class="city-info-display">
                  <div v-if="cityInfo.logo" class="city-logo-container">
                    <img
                      :src="cityInfo.logo"
                      alt="Logo de la commune"
                      class="city-logo"
                    />
                  </div>

                  <ion-item lines="none">
                    <ion-label>
                      <h3>Nom de la commune</h3>
                      <p>{{ cityInfo.name }}</p>
                    </ion-label>
                  </ion-item>

                  <ion-item lines="none">
                    <ion-label>
                      <h3>Code postal</h3>
                      <p>{{ cityInfo.postalCode }}</p>
                    </ion-label>
                  </ion-item>

                  <ion-item lines="none">
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
                  class="change-city-button"
                >
                  Changer de commune
                </ion-button>

                <div class="modification-info">
                  <ion-icon :icon="mailOutline" class="info-icon" />
                  <p class="info-text">
                    Pour modifier ces informations, veuillez envoyer un email à
                    <a href="mailto:contact@commune-plus.fr" class="email-link"
                      >contact@commune-plus.fr</a
                    >
                  </p>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <AppDisclaimer />
      </div>
    </ion-content>

    <CitySetupModal
      :is-open="showCityModal"
      @saved="handleCityInfoSaved"
      @close="handleCityModalClose"
    />
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useKeyboardScrollReset } from '@/composables/useKeyboardScrollReset'
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
import { person, location, mailOutline } from 'ionicons/icons'
import {
  saveUserContact,
  getUserContact,
  getCityInfo,
  getCityInfoFromDatabase,
  refreshCityInfoFromDatabase
} from '@/utils/storage'
import { updatePushTokenEmail } from '@/services/push-notifications'
import { updateUserAndCommuneContext } from '@/services/posthog'
import CitySetupModal from '@/components/city-setup-modal.vue'
import AppDisclaimer from '@/components/app-disclaimer.vue'

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
const pageContentRef = ref(null)
const { resetScroll: resetPageScroll } = useKeyboardScrollReset(pageContentRef)

const loadData = async () => {
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

  // Charger les informations de la commune depuis le localStorage d'abord
  let savedCityInfo = getCityInfo()
  if (savedCityInfo?.id) {
    await refreshCityInfoFromDatabase()
    savedCityInfo = getCityInfo()
  }

  // Si pas dans le localStorage, essayer de charger depuis la base de données
  if (!savedCityInfo || !savedCityInfo.name) {
    try {
      savedCityInfo = await getCityInfoFromDatabase()
    } catch (error) {
      console.error('Error loading city info from database:', error)
    }
  }

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

    const emailTrimmed = userForm.value.email.trim()
    if (emailTrimmed) {
      await updatePushTokenEmail(emailTrimmed)
    }

    updateUserAndCommuneContext()
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
      message: "Erreur lors de l'enregistrement",
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

const handleCityModalClose = async () => {
  showCityModal.value = false
  await resetPageScroll()
}

const handleCityInfoSaved = async () => {
  await handleCityModalClose()
  await loadData()
  updateUserAndCommuneContext()
}

onMounted(async () => {
  await loadData()
})
</script>

<style lang="scss" scoped>
.settings-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 0 4px;

  ion-icon {
    font-size: 24px;
    color: var(--ion-color-primary);
  }
}

ion-card {
  margin: 0;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.save-button,
.edit-button,
.change-city-button {
  margin-top: 16px;
}

.no-city-info {
  text-align: center;
  padding: 24px 0;

  p {
    color: var(--ion-color-medium);
    margin-bottom: 16px;
  }
}

.city-info-display {
  margin-bottom: 16px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--ion-color-dark);
    margin: 0 0 4px 0;
  }

  p {
    font-size: 16px;
    color: var(--ion-color-medium);
    margin: 0;
  }

  ion-item {
    --background: var(--ion-color-light);
    --border-radius: 8px;
    margin-bottom: 12px;
    padding: 12px 0;
  }
}

.city-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 16px;

  .city-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    background: white;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.modification-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-top: 16px;

  .info-icon {
    font-size: 24px;
    color: var(--ion-color-primary);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .info-text {
    flex: 1;
    margin: 0;
    font-size: 14px;
    color: var(--ion-color-dark);
    line-height: 1.5;
  }

  .email-link {
    color: var(--ion-color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.page-content::part(scroll) {
  overscroll-behavior-y: contain;
}
</style>
