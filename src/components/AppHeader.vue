<template>
  <IonHeader>
    <IonToolbar color="primary">
      <IonTitle>{{ title }}</IonTitle>
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
  IonIcon
} from '@ionic/vue'
import { settings } from 'ionicons/icons'
defineProps({
  title: {
    type: String,
    default: 'Commune Plus'
  }
})
</script>
