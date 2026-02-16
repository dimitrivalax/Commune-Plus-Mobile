<template>
  <SplashScreen />
  <ion-app>
    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-menu-toggle auto-hide>
            <ion-item button href="/tabs/home">
              <ion-icon :icon="homeOutline" slot="start" />
              <ion-label>Accueil</ion-label>
            </ion-item>
            <ion-item button href="/tabs/signalements">
              <ion-icon :icon="warningOutline" slot="start" />
              <ion-label>Signalements</ion-label>
            </ion-item>
            <ion-item button href="/tabs/info">
              <ion-icon :icon="newspaperOutline" slot="start" />
              <ion-label>Actualités</ion-label>
            </ion-item>
            <ion-item button href="/tabs/reservations">
              <ion-icon :icon="calendarOutline" slot="start" />
              <ion-label>Réservations</ion-label>
            </ion-item>
            <ion-item button href="/tabs/propositions">
              <ion-icon :icon="bookOutline" slot="start" />
              <ion-label>Doléances</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-router-outlet id="main-content" />
  </ion-app>
  <CitySetupModal
    :is-open="showCitySetupModal"
    @saved="handleCityInfoSaved"
    :allow-cancel="false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle
} from '@ionic/vue'
import { App } from '@capacitor/app'
import { useRouter } from 'vue-router'
import SplashScreen from '@/components/splash-screen.vue'
import CitySetupModal from '@/components/city-setup-modal.vue'
import { isCityInfoComplete } from '@/utils/storage'
import {
  homeOutline,
  warningOutline,
  newspaperOutline,
  calendarOutline,
  bookOutline
} from 'ionicons/icons'

const router = useRouter()
const showCitySetupModal = ref(false)

const checkCityInfo = () => {
  if (!isCityInfoComplete()) {
    // Attendre un peu pour que le splash screen se termine
    setTimeout(() => {
      showCitySetupModal.value = true
    }, 2500)
  }
}

const handleCityInfoSaved = () => {
  showCitySetupModal.value = false
}

// Gérer l'ouverture de l'app depuis une notification
const handleAppUrlOpen = async (event) => {
  console.log('App opened from URL:', event)

  // Si l'app est ouverte depuis une notification, les données peuvent être dans event.url ou event.data
  // Pour les notifications push, les données sont généralement dans event.data
  if (event.data) {
    const data =
      typeof event.data === 'string' ? JSON.parse(event.data) : event.data

    if (data?.info_id || data?.infoId) {
      const infoId = data.info_id || data.infoId
      console.log('App opened from notification, navigating to info:', infoId)

      // Attendre que le router soit prêt
      await router.isReady()

      // Naviguer vers la page de détail
      router.push(`/info/${infoId}`)
    }
  }
}

onMounted(() => {
  checkCityInfo()

  // Écouter l'événement d'ouverture de l'app depuis une notification
  App.addListener('appUrlOpen', handleAppUrlOpen)

  // Vérifier si l'app a été ouverte depuis une notification au démarrage
  App.getLaunchUrl()
    .then((result) => {
      if (result?.url) {
        console.log('App launched from URL:', result.url)
        // Les données de notification peuvent être dans l'URL ou dans le state de l'app
      }
    })
    .catch(() => {
      // Pas d'URL de lancement, c'est normal
    })
})
</script>
