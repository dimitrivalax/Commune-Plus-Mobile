<template>
  <div class="disclaimer-container">
    <div class="disclaimer-title">
      <ion-icon :icon="informationCircleOutline" />
      <span>Note importante</span>
    </div>
    <p class="disclaimer-text">
      Cette application est un outil indépendant destiné à faciliter les
      échanges entre les citoyens et les services municipaux. Elle
      <strong
        >n'est pas une application officielle gouvernementale ou
        municipale</strong
      >.
    </p>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'
import { informationCircleOutline } from 'ionicons/icons'
</script>

<style scoped>
.disclaimer-container {
  margin: 24px 16px;
  padding: 16px;
  background-color: var(--ion-color-light);
  border-radius: 12px;
  border: 1px solid var(--ion-color-medium-low, #e0e0e0);
}

.disclaimer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--ion-color-medium);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.disclaimer-title ion-icon {
  font-size: 20px;
}

.disclaimer-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
  text-align: justify;
}

.disclaimer-text strong {
  color: var(--ion-color-dark);
}
</style>
