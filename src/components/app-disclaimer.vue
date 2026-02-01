<template>
  <div class="disclaimer-container">
    <div class="disclaimer-title"></div>
    <p class="disclaimer-link">
      Pour toutes questions contactez-nous par email :
      <a href="mailto:contact@commune-plus.fr">contact@commune-plus.fr</a>
    </p>
    <p class="disclaimer-link">
      Consulter les
      <a
        href="https://kdrive.infomaniak.com/app/share/2122574/dd659653-bda2-42b7-9679-08c97408efbe"
        target="_blank"
        rel="noopener noreferrer"
        >Conditions Générales d'Utilisation (CGU)</a
      >
    </p>
  </div>
</template>

<script setup>
import { IonIcon } from '@ionic/vue'
import { informationCircleOutline } from 'ionicons/icons'
</script>

<style lang="scss" scoped>
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

  ion-icon {
    font-size: 20px;
  }
}

.disclaimer-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ion-color-medium);
  text-align: justify;

  strong {
    color: var(--ion-color-dark);
  }
}

.disclaimer-link {
  margin-top: 12px;
  font-size: 13px;
  text-align: center;

  a {
    color: var(--city-primary, var(--ion-color-primary));
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
