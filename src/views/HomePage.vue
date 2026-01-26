<template>
  <IonPage>
    <AppHeader title="Accueil" :logo="true"></AppHeader>
    <IonContent :fullscreen="true">
      <div class="ion-padding">
        <div>
          <IonCard
            button
            @click="$router.push('/tabs/signalements')"
            class="service-card"
          >
            <IonCardContent>
              <div class="service-icon">
                <IonIcon :icon="warning" />
              </div>
              <h3>Faire un signalement</h3>
              <p>Prenez une photo et faites un signalement dans votre ville.</p>
            </IonCardContent>
          </IonCard>

          <IonCard
            button
            @click="$router.push('/tabs/reservations')"
            class="service-card"
          >
            <IonCardContent>
              <div class="service-icon">
                <IonIcon :icon="calendar" />
              </div>
              <h3>Réserver une salle</h3>
              <p>Réservez une salle municipale pour vos événements.</p>
            </IonCardContent>
          </IonCard>

          <IonCard
            button
            @click="$router.push('/tabs/info')"
            class="service-card"
          >
            <IonCardContent>
              <div class="service-icon">
                <IonIcon :icon="informationCircle" />
              </div>
              <h3>Informations municipales</h3>
              <p>Consultez les dernières informations de la mairie.</p>
            </IonCardContent>
          </IonCard>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/vue'
import { warning, calendar, informationCircle } from 'ionicons/icons'
import CityHeader from '@/components/CityHeader.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppDisclaimer from '@/components/AppDisclaimer.vue'
</script>

<style scoped>
.service-card {
  margin-bottom: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-primary-shade)
  );
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
