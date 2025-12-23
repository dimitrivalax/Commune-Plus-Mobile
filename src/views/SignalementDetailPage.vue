<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/signalements"></ion-back-button>
        </ion-buttons>
        <ion-title>Détail du signalement</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleEditMode" v-if="!isDeleting">
            <ion-icon :icon="isEditing ? close : create" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement...</p>
      </div>

      <div v-else-if="signalement" class="detail-container">
        <!-- Mode affichage -->
        <div v-if="!isEditing" class="view-mode">
          <!-- Photo -->
          <div v-if="signalement.photo_url" class="photo-section">
            <img :src="signalement.photo_url" alt="Photo du signalement" class="detail-photo" />
          </div>

          <!-- Informations principales -->
          <ion-card class="info-card">
            <ion-card-header>
              <div class="card-header-row">
                <ion-card-title>Description</ion-card-title>
                <ion-badge :color="getStatusColor(signalement.status)">
                  {{ getStatusLabel(signalement.status) }}
                </ion-badge>
              </div>
            </ion-card-header>
            <ion-card-content>
              <p class="description-text">{{ signalement.description || 'Aucune description' }}</p>
              <p v-if="signalement.comment" class="comment-text">
                <strong>Commentaire :</strong> {{ signalement.comment }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Localisation -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="locationIcon" /> Localisation
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div v-if="signalement.latitude && signalement.longitude">
                <p><strong>Coordonnées GPS :</strong></p>
                <p>{{ signalement.latitude.toFixed(6) }}, {{ signalement.longitude.toFixed(6) }}</p>
                <p v-if="signalement.location_accuracy" class="accuracy-text">
                  Précision : {{ Math.round(signalement.location_accuracy) }}m
                </p>
              </div>
              <div v-if="signalement.address">
                <p><strong>Adresse :</strong></p>
                <p>{{ signalement.address }}</p>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Coordonnées du déclarant -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="person" /> Coordonnées
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Nom :</strong> {{ signalement.first_name }} {{ signalement.last_name }}</p>
              <p v-if="signalement.email"><strong>Email :</strong> {{ signalement.email }}</p>
              <p v-if="signalement.phone"><strong>Téléphone :</strong> {{ signalement.phone }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Métadonnées -->
          <ion-card class="info-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon :icon="time" /> Informations
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><strong>Date de création :</strong> {{ formatDateTime(signalement.created_at) }}</p>
              <p v-if="signalement.updated_at !== signalement.created_at">
                <strong>Dernière modification :</strong> {{ formatDateTime(signalement.updated_at) }}
              </p>
            </ion-card-content>
          </ion-card>

          <!-- Bouton de suppression -->
          <div class="action-buttons">
            <ion-button
              expand="block"
              color="danger"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <ion-icon :icon="trash" slot="start" />
              Supprimer le signalement
            </ion-button>
          </div>
        </div>

        <!-- Mode édition -->
        <div v-else class="edit-mode">
          <div class="form-container">
            <div class="form-section">
              <h3 class="section-title">Description</h3>
              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Description du signalement</ion-label>
                <ion-textarea
                  v-model="editForm.description"
                  placeholder="Décrivez le signalement..."
                  rows="4"
                ></ion-textarea>
              </ion-item>

              <ion-item lines="none" class="form-item">
                <ion-label position="stacked">Commentaire</ion-label>
                <ion-textarea
                  v-model="editForm.comment"
                  placeholder="Commentaire sur la photo (optionnel)..."
                  rows="3"
                ></ion-textarea>
              </ion-item>
            </div>

            <div class="form-section">
              <h3 class="section-title">Coordonnées</h3>
              <ion-card class="contact-card">
                <ion-card-content>
                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Nom *</ion-label>
                    <ion-input
                      v-model="editForm.lastName"
                      placeholder="Votre nom"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Prénom *</ion-label>
                    <ion-input
                      v-model="editForm.firstName"
                      placeholder="Votre prénom"
                      required
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Email</ion-label>
                    <ion-input
                      v-model="editForm.email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                    ></ion-input>
                  </ion-item>

                  <ion-item lines="none" class="form-item">
                    <ion-label position="stacked">Téléphone</ion-label>
                    <ion-input
                      v-model="editForm.phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                    ></ion-input>
                  </ion-item>
                </ion-card-content>
              </ion-card>
            </div>

            <div class="action-buttons">
              <ion-button
                expand="block"
                @click="saveChanges"
                :disabled="saving || !editForm.lastName || !editForm.firstName"
                class="save-button"
              >
                <ion-icon :icon="checkmark" slot="start" />
                Enregistrer les modifications
              </ion-button>
              <ion-button
                expand="block"
                fill="outline"
                @click="cancelEdit"
                :disabled="saving"
              >
                Annuler
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error-container">
        <ion-icon :icon="alertCircle" class="error-icon" />
        <h3>Signalement introuvable</h3>
        <ion-button expand="block" @click="$router.push('/tabs/signalements')">
          Retour à la liste
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonItem, IonLabel, IonTextarea, IonInput, IonSelect, IonSelectOption, IonSpinner, loadingController, toastController, alertController } from '@ionic/vue'
import { create, close, trash, checkmark, location as locationIcon, person, time, alertCircle } from 'ionicons/icons'
import { supabase } from '@/services/supabase'
import { formatDateTime } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const signalement = ref(null)
const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const isDeleting = ref(false)

const editForm = ref({
  description: '',
  comment: '',
  status: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
})

const loadSignalement = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('signalements')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    signalement.value = data
    // Initialiser le formulaire d'édition
    editForm.value = {
      description: data.description || '',
      comment: data.comment || '',
      status: data.status || 'en_attente',
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      email: data.email || '',
      phone: data.phone || ''
    }
  } catch (error) {
    console.error('Error loading signalement:', error)
    const toast = await toastController.create({
      message: 'Erreur lors du chargement du signalement',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value && signalement.value) {
    // Réinitialiser le formulaire avec les valeurs actuelles
    editForm.value = {
      description: signalement.value.description || '',
      comment: signalement.value.comment || '',
      status: signalement.value.status || 'en_attente',
      firstName: signalement.value.first_name || '',
      lastName: signalement.value.last_name || '',
      email: signalement.value.email || '',
      phone: signalement.value.phone || ''
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveChanges = async () => {
  if (!editForm.value.lastName || !editForm.value.firstName) {
    const toast = await toastController.create({
      message: 'Le nom et le prénom sont obligatoires',
      duration: 2000,
      color: 'warning'
    })
    await toast.present()
    return
  }

  saving.value = true
  const loadingToast = await loadingController.create({
    message: 'Enregistrement en cours...'
  })
  await loadingToast.present()

  try {
    const { data, error } = await supabase
      .from('signalements')
      .update({
        description: editForm.value.description,
        comment: editForm.value.comment,
        status: editForm.value.status,
        first_name: editForm.value.firstName,
        last_name: editForm.value.lastName,
        email: editForm.value.email || null,
        phone: editForm.value.phone || null
      })
      .eq('id', route.params.id)
      .select()
      .single()

    if (error) throw error

    signalement.value = data
    isEditing.value = false

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Modifications enregistrées avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Error updating signalement:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Erreur lors de l\'enregistrement',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          deleteSignalement()
        }
      }
    ]
  })

  await alert.present()
}

const deleteSignalement = async () => {
  isDeleting.value = true
  const loadingToast = await loadingController.create({
    message: 'Suppression en cours...'
  })
  await loadingToast.present()

  try {
    const { error } = await supabase
      .from('signalements')
      .delete()
      .eq('id', route.params.id)

    if (error) throw error

    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Signalement supprimé avec succès',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.push('/tabs/signalements')
  } catch (error) {
    console.error('Error deleting signalement:', error)
    await loadingToast.dismiss()

    const toast = await toastController.create({
      message: 'Erreur lors de la suppression',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    isDeleting.value = false
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'traité':
      return 'success'
    case 'en_cours':
      return 'warning'
    case 'en_attente':
    default:
      return 'medium'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'traité':
      return 'Traité'
    case 'en_cours':
      return 'En cours'
    case 'en_attente':
    default:
      return 'En attente'
  }
}

onMounted(() => {
  loadSignalement()
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.detail-container {
  padding: 16px;
}

.view-mode,
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo-section {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-photo {
  width: 100%;
  height: auto;
  display: block;
}

.info-card {
  margin: 0;
  border-radius: 12px;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.comment-text {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ion-color-light);
  font-style: italic;
  color: var(--ion-color-medium);
}

.accuracy-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  height: 48px;
  font-weight: 600;
}

.form-container {
  padding: 0;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 16px 0;
  padding: 0 4px;
}

.form-item {
  --background: var(--ion-color-light);
  --border-radius: 12px;
  margin-bottom: 16px;
  padding: 4px 0;
}

.contact-card {
  margin: 0;
  background: var(--ion-color-light);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.error-container h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin: 0 0 24px 0;
}
</style>

