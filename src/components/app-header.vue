<template>
  <IonHeader>
    <IonToolbar>
      <IonRow>
        <img :src="'/assets/logo.png'" alt="Logo" class="city-logo" />
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
  IonRow
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

<style lang="scss" scoped>
.city-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 24px;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 16px;
}
</style>
