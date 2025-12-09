<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Accueil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$router.push('/settings')">
            <ion-icon :icon="settings" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <CityHeader subtitle="Services municipaux" />
      
      <div class="ion-padding">
        <div class="welcome-section">
          <h2 class="section-title">Services disponibles</h2>
          
          <ion-card button @click="$router.push('/tabs/signalements')" class="service-card">
            <ion-card-content>
              <div class="service-icon">
                <ion-icon :icon="warning" />
              </div>
              <h3>Faire un signalement</h3>
              <p>Prenez une photo et faites un signalement dans votre ville.</p>
            </ion-card-content>
          </ion-card>

          <ion-card button @click="$router.push('/tabs/reservations')" class="service-card">
            <ion-card-content>
              <div class="service-icon">
                <ion-icon :icon="calendar" />
              </div>
              <h3>Réserver une salle</h3>
              <p>Réservez une salle municipale pour vos événements.</p>
            </ion-card-content>
          </ion-card>

          <ion-card button @click="$router.push('/tabs/info')" class="service-card">
            <ion-card-content>
              <div class="service-icon">
                <ion-icon :icon="informationCircle" />
              </div>
              <h3>Informations municipales</h3>
              <p>Consultez les dernières informations de la mairie.</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonIcon, IonButtons, IonButton } from '@ionic/vue'
import { warning, calendar, informationCircle, settings } from 'ionicons/icons'
import CityHeader from '@/components/CityHeader.vue'
</script>

<style scoped>
.welcome-section {
  margin-top: 16px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 20px;
  padding: 0;
}

.service-card {
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.service-card:active {
  transform: scale(0.98);
}

.service-card ion-card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
}

.service-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.service-icon ion-icon {
  font-size: 28px;
  color: white;
}

.service-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 8px 0;
}

.service-card p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
  line-height: 1.5;
}
</style>

