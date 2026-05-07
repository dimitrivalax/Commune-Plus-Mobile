<!-- eslint-disable vue/no-deprecated-slot-attribute -->
<template>
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonMenuButton menu="main-menu" auto-hide="false" />
      </IonButtons>
      <IonRow>
        <IonTitle v-if="!logo">{{ title }}</IonTitle>
        <CityHeader v-else></CityHeader>
      </IonRow>
      <IonButtons slot="end">
        <IonButton @click="$router.push('/settings')" color="light">
          <IonIcon :icon="settings" />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
</template>

<script setup>
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonRow,
  IonMenuButton
} from '@ionic/vue'
import { settings } from 'ionicons/icons'
import CityHeader from '@/components/city-header.vue'
defineProps({
  title: {
    type: String,
    default: 'Commune Plus'
  },
  logo: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped></style>
