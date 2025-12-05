<template>
  <SplashScreen />
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import SplashScreen from '@/components/SplashScreen.vue'
</script>


