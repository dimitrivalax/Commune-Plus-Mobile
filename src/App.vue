<template>
  <SplashScreen />
  <ion-app>
    <ion-router-outlet />
  </ion-app>
  <CitySetupModal :is-open="showCitySetupModal" @saved="handleCityInfoSaved" :allow-cancel="false" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import SplashScreen from '@/components/SplashScreen.vue'
import CitySetupModal from '@/components/CitySetupModal.vue'
import { isCityInfoComplete } from '@/utils/storage'

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


onMounted(() => {
  checkCityInfo()
  
})
</script>


