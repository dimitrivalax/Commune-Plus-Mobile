<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>Accueil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="signalements" href="/tabs/signalements">
          <ion-icon :icon="warning" />
          <ion-label>Signalements</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="reservations" href="/tabs/reservations">
          <ion-icon :icon="calendar" />
          <ion-label>Réservations</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="info" href="/tabs/info">
          <ion-icon :icon="informationCircle" />
          <ion-label>Infos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import { IonTabBar, IonTabButton, IonTabs, IonRouterOutlet, IonLabel, IonIcon, IonPage } from '@ionic/vue'
import { home, warning, calendar, informationCircle } from 'ionicons/icons'
</script>

<style>
ion-tab-bar {
  --background: white;
  --border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  padding-bottom: env(safe-area-inset-bottom);
}

ion-tab-button {
  --color-selected: var(--ion-color-primary);
  font-size: 12px;
  font-weight: 500;
}

ion-tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>

