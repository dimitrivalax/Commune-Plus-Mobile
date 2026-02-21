<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" color="primary">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>Accueil</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="signalements" href="/tabs/signalements">
          <ion-icon :icon="warning" />
          <ion-label>Signalements</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="info" href="/tabs/info">
          <ion-icon :icon="newspaper" />
          <ion-label>Actualités</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="menu" @click.prevent="openMenu">
          <ion-icon :icon="menuOutline" />
          <ion-label>Menu</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
  IonLabel,
  IonIcon,
  IonPage,
  menuController
} from '@ionic/vue'
import { home, warning, newspaper, menuOutline } from 'ionicons/icons'

const openMenu = () => {
  menuController.open()
}
</script>

<style lang="scss">
ion-tab-bar {
  --background: white;
  --border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  padding-bottom: calc(8px + var(--ion-safe-area-bottom, 0px));
}

ion-tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  // --color-focused: var(--ion-color-secondary);
  font-size: 12px;
  font-weight: 500;

  ion-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
}

/* L’élément <a class="button-native"> ne doit pas cacher icône/label au hover */
ion-tab-button::part(native) {
  background: transparent;
}

ion-tab-button::part(native):hover,
ion-tab-button::part(native):active {
  background: var(--ion-color-primary-tint);
  border-radius: 10px;
  transition: all 0.3s ease;
  transform: scale(1.05);
}
</style>
