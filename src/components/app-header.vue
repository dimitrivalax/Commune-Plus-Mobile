<template>
  <IonHeader>
    <IonToolbar>
      <template v-slot:start>
        <IonButtons>
          <IonMenuButton />
        </IonButtons>
      </template>
      <IonRow>
        <IonTitle v-if="!logo">{{ title }}</IonTitle>
        <CityHeader v-else></CityHeader>
      </IonRow>
      <template v-slot:end>
        <IonButtons>
          <IonButton @click="$router.push('/settings')" color="light">
            <IonIcon :icon="settings" />
          </IonButton>
        </IonButtons>
      </template>
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
