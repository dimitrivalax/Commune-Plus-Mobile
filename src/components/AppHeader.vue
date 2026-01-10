<template>
  <IonHeader>
    <IonToolbar color="primary">
      <IonRow>
          <img :src="'/assets/logo.png'" alt="Logo" class="city-logo" />
          <IonTitle>{{ title }}</IonTitle>
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
defineProps({
  title: {
    type: String,
    default: 'Commune Plus'
  }
})
</script>

<style scoped>
.city-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  background: white;
  border-radius: 24px;
  margin: 4px;
}
</style>
