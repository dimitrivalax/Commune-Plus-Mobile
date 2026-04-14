<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start">
          <IonBackButton default-href="/tabs/propositions"></IonBackButton>
        </IonButtons>
        <IonTitle>Détail de la Proposition</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent :fullscreen="true">
      <div v-if="loading" class="loading-state">
        <IonSpinner name="crescent" />
      </div>

      <div v-else-if="proposition" class="detail-container">
        <!-- Photo Section -->
        <div v-if="proposition.photo_url" class="photo-section">
          <img
            :src="proposition.photo_url"
            :alt="proposition.name"
            class="detail-photo"
          />
        </div>

        <div class="content-section">
          <div class="header-row">
            <h1>{{ proposition.name }}</h1>
            <IonBadge color="primary" class="vote-badge">
              <IonIcon :icon="thumbsUp" />
              {{ proposition.votes_count }}
            </IonBadge>
          </div>

          <div class="creator-info">
            <IonIcon :icon="personCircleOutline" />
            <span
              >Par {{ proposition.user_firstname }}
              {{ proposition.user_lastname }} •
              {{ formatDate(proposition.created_at) }}</span
            >
          </div>

          <div class="description" v-html="proposition.description"></div>

          <!-- Vote Area -->
          <div class="vote-action-section">
            <IonButton
              v-if="!proposition.has_voted"
              expand="block"
              @click="handleVote"
              :disabled="voting"
            >
              <IonIcon :icon="thumbsUpOutline" slot="start" />
              Soutenir cette proposition
            </IonButton>
            <div v-else class="voted-message">
              <span class="voted-message-text">
                <IonIcon :icon="checkmarkCircle" />
                Vous soutenez déjà cette proposition
              </span>
              <IonButton
                fill="outline"
                size="small"
                color="medium"
                class="unvote-btn"
                :disabled="voting"
                @click="handleUnvote"
              >
                Ne plus soutenir
              </IonButton>
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- Comments Section -->
          <div class="comments-section">
            <div class="comments-header">
              <h3>Commentaires ({{ proposition.comments.length }})</h3>
            </div>

            <IonList lines="none" class="comments-list">
              <IonItem
                v-for="comment in proposition.comments"
                :key="comment.id"
                class="comment-item"
              >
                <IonLabel>
                  <div class="comment-author">
                    {{ comment.user_firstname }} {{ comment.user_lastname }}
                  </div>
                  <div class="comment-date">
                    {{ formatDateTime(comment.created_at) }}
                  </div>
                  <p v-if="editingCommentId !== comment.id" class="comment-content">{{ comment.content }}</p>
                  <div v-else class="edit-comment-box">
                    <IonTextarea v-model="editingCommentContent" rows="3" />
                    <div class="edit-actions">
                      <IonButton size="small" fill="clear" @click="cancelEditComment">Annuler</IonButton>
                      <IonButton
                        size="small"
                        :disabled="!editingCommentContent.trim() || commenting"
                        @click="saveEditedComment"
                      >
                        Enregistrer
                      </IonButton>
                    </div>
                  </div>
                  <IonButton
                    v-if="canEditComment(comment) && editingCommentId !== comment.id"
                    size="small"
                    fill="clear"
                    class="edit-comment-trigger"
                    @click="startEditComment(comment)"
                  >
                    Modifier
                  </IonButton>
                </IonLabel>
              </IonItem>
              <div v-if="proposition.comments.length === 0" class="no-comments">
                Aucun commentaire pour le moment.
              </div>
            </IonList>

            <!-- Add Comment Form -->
            <div class="add-comment-form">
              <h4>Ajouter un commentaire</h4>
              <IonItem lines="none" class="form-item">
                <IonTextarea
                  v-model="newComment"
                  placeholder="Votre commentaire..."
                  rows="3"
                ></IonTextarea>
              </IonItem>
              <IonButton
                expand="block"
                fill="outline"
                @click="handleAddComment"
                :disabled="!newComment.trim() || commenting"
              >
                {{ commenting ? 'Envoi...' : 'Commenter' }}
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  alertController,
  toastController
} from '@ionic/vue'
import {
  thumbsUp,
  thumbsUpOutline,
  personCircleOutline,
  checkmarkCircle
} from 'ionicons/icons'
import { PropositionService } from '@/services/proposition-service'
import { getUserContact, saveUserContact } from '@/utils/storage'
import { formatDate, formatDateTime } from '@/utils/date'
import { trackEvent } from '@/services/posthog'

const route = useRoute()
const proposition = ref(null)
const loading = ref(true)
const voting = ref(false)
const commenting = ref(false)
const newComment = ref('')
const editingCommentId = ref(null)
const editingCommentContent = ref('')
const hasTrackedView = ref(false)

/** Email de l'utilisateur courant (stocké en minuscules pour comparaison). */
const currentUserEmail = computed(() => {
  const email = getUserContact()?.email?.trim()
  return email ? email.toLowerCase() : null
})

const loadProposition = async () => {
  try {
    loading.value = true
    const userEmail = getUserContact()?.email?.trim() || null
    const { data, error } = await PropositionService.getById(
      route.params.id,
      userEmail
    )
    if (error) throw error
    proposition.value = data
    if (proposition.value && !hasTrackedView.value) {
      trackEvent('proposition_viewed', {
        proposition_id: String(proposition.value.id),
        source: 'detail_page'
      })
      hasTrackedView.value = true
    }
  } catch (error) {
    console.error('Error loading proposition:', error)
  } finally {
    loading.value = false
  }
}

const canEditComment = (comment) => {
  const email = (comment?.user_email || '').trim().toLowerCase()
  return !!currentUserEmail.value && email === currentUserEmail.value && comment?.author_type !== 'commune'
}

const startEditComment = (comment) => {
  editingCommentId.value = comment.id
  editingCommentContent.value = comment.content || ''
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editingCommentContent.value = ''
}

const saveEditedComment = async () => {
  if (!editingCommentId.value || !editingCommentContent.value.trim()) return
  commenting.value = true
  try {
    const { error } = await PropositionService.updateComment(
      editingCommentId.value,
      editingCommentContent.value,
      currentUserEmail.value
    )
    if (error) throw error
    cancelEditComment()
    await loadProposition()
    const toast = await toastController.create({
      message: 'Commentaire modifié.',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    const toast = await toastController.create({
      message: error?.message || 'Impossible de modifier ce commentaire.',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    commenting.value = false
  }
}

/** Récupère l'email (depuis le contact ou en le demandant à l'utilisateur). Retourne null si annulé. */
const getEmailForVote = async () => {
  const contact = getUserContact()
  let email = contact?.email?.trim()
  if (email) return email

  return new Promise((resolve) => {
    alertController
      .create({
        header: 'Email requis',
        message:
          "Pour soutenir cette proposition, merci de renseigner votre adresse email. Elle permet d'identifier votre vote.",
        inputs: [
          {
            name: 'email',
            placeholder: 'votre.email@exemple.com',
            type: 'email',
            value: email || ''
          }
        ],
        buttons: [
          { text: 'Annuler', role: 'cancel', handler: () => resolve(null) },
          {
            text: 'Valider',
            handler: (data) => {
              const e = data?.email?.trim()
              if (!e) return false
              saveUserContact({
                firstName: contact?.firstName ?? '',
                lastName: contact?.lastName ?? '',
                email: e,
                phone: contact?.phone ?? '',
                address: contact?.address ?? ''
              })
              resolve(e)
            }
          }
        ]
      })
      .then((alert) => alert.present())
  })
}

const handleVote = async () => {
  if (voting.value) return
  const userEmail = await getEmailForVote()
  if (!userEmail) return
  voting.value = true
  try {
    const { error } = await PropositionService.vote(
      proposition.value.id,
      userEmail
    )
    if (error) throw error

    await loadProposition()

    const toast = await toastController.create({
      message: 'Vote enregistré !',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Error voting:', error)
    const toast = await toastController.create({
      message:
        error?.message === 'Already voted'
          ? 'Vous soutenez déjà cette proposition.'
          : "Impossible d'enregistrer le vote.",
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    voting.value = false
  }
}

const handleUnvote = async () => {
  if (voting.value) return
  const userEmail = currentUserEmail.value || (await getEmailForVote())
  if (!userEmail) return
  voting.value = true
  try {
    const { error } = await PropositionService.unvote(
      proposition.value.id,
      userEmail
    )
    if (error) throw error

    await loadProposition()

    const toast = await toastController.create({
      message: 'Vous ne soutenez plus cette proposition.',
      duration: 2000,
      color: 'medium'
    })
    await toast.present()
  } catch (error) {
    console.error('Error unvoting:', error)
    const toast = await toastController.create({
      message: 'Impossible de retirer votre soutien.',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    voting.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim() || commenting.value) return

  const contact = getUserContact()
  let firstName = contact?.firstName
  let lastName = contact?.lastName
  let email = contact?.email

  // Si pas d'infos contact, demander via une alerte polie (ou rediriger vers settings, mais ici on va faire une modale simple ou prompt)
  if (!firstName || !lastName || !email) {
    const alert = await alertController.create({
      header: 'Presque fini !',
      message:
        'Pour laisser un commentaire, merci de renseigner vos coordonnées (seul le nom sera affiché).',
      inputs: [
        { name: 'firstName', placeholder: 'Prénom', value: firstName || '' },
        { name: 'lastName', placeholder: 'Nom', value: lastName || '' },
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email',
          value: email || ''
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Valider',
          handler: (data) => {
            if (!data.firstName || !data.lastName || !data.email) return false
            firstName = data.firstName
            lastName = data.lastName
            email = data.email
            saveUserContact({ firstName, lastName, email })
            performAddComment(firstName, lastName, email)
          }
        }
      ]
    })
    await alert.present()
  } else {
    performAddComment(firstName, lastName, email)
  }
}

const performAddComment = async (firstName, lastName, email) => {
  commenting.value = true
  try {
    const commentData = {
      proposition_id: proposition.value.id,
      user_firstname: firstName,
      user_lastname: lastName,
      user_email: email,
      content: newComment.value.trim()
    }

    const { error } = await PropositionService.addComment(commentData)
    if (error) throw error

    newComment.value = ''
    await loadProposition()

    // Trigger notification (to be implemented on backend)

    const toast = await toastController.create({
      message: 'Commentaire ajouté !',
      duration: 2000,
      color: 'success'
    })
    await toast.present()
  } catch (error) {
    console.error('Error adding comment:', error)
  } finally {
    commenting.value = false
  }
}

onMounted(() => {
  loadProposition()
})
</script>

<style lang="scss" scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.photo-section {
  width: 100%;
  aspect-ratio: 16/9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.content-section {
  padding: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    flex: 1;
    color: var(--ion-color-dark);
  }
}

.vote-badge {
  font-size: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;

  ion-icon {
    font-size: 20px;
  }
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ion-color-step-800);
  margin-bottom: 30px;
}

.description :deep(p) {
  margin: 0 0 10px;
}

.description :deep(ul),
.description :deep(ol) {
  padding-left: 20px;
  margin: 0 0 10px;
}

.vote-action-section {
  margin-bottom: 30px;
}

.voted-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--ion-color-success);
  font-weight: 500;
  padding: 12px;
  background: var(--ion-color-success-light, #e8f5e9);
  border-radius: 12px;
}

.voted-message-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voted-message .unvote-btn {
  margin-top: 4px;
}

.section-divider {
  height: 1px;
  background: var(--ion-color-light-shade, #e0e0e0);
  margin: 24px 0;
}

.comments-header {
  margin-bottom: 16px;
  h3 {
    font-size: 18px;
    font-weight: 600;
  }
}

.comments-list {
  background: transparent;
  margin-bottom: 24px;
}

.comment-item {
  --background: var(--ion-color-light);
  --border-radius: 12px;
  margin-bottom: 12px;
  --padding-start: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: var(--ion-color-dark);
}

.comment-date {
  font-size: 11px;
  color: var(--ion-color-medium);
  margin-bottom: 6px;
}

.comment-content {
  font-size: 14px;
  color: var(--ion-color-step-700);
  line-height: 1.4;
}

.edit-comment-box {
  margin-top: 8px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-comment-trigger {
  margin-top: 6px;
}

.no-comments {
  text-align: center;
  color: var(--ion-color-medium);
  padding: 20px;
  font-style: italic;
}

.add-comment-form {
  background: var(--ion-color-light);
  padding: 16px;
  border-radius: 16px;
  margin-top: 24px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.form-item {
  --background: white;
  --border-radius: 8px;
  margin-bottom: 12px;
}
</style>
