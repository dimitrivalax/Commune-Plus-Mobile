import { PushNotifications } from '@capacitor/push-notifications'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { Capacitor } from '@capacitor/core'
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { getFirestoreDb } from './firebase'
import { getCityInfo, getUserContact } from '@/utils/storage'
import { trackEvent } from './posthog'

/**
 * Service de gestion des push notifications
 */

let isInitialized = false

const db = () => getFirestoreDb()

/**
 * Initialise les push notifications et enregistre le token
 */
export async function initializePushNotifications() {
  // Vérifier si on est sur une plateforme native
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only available on native platforms')
    return
  }

  if (isInitialized) {
    return
  }

  try {
    // Fonction helper pour naviguer vers une information
    const navigateToInfo = async (infoId) => {
      if (!infoId) {
        console.warn('No info ID provided for navigation')
        return
      }

      try {
        const router = (await import('@/router')).default

        // Attendre que le router soit prêt
        await router.isReady()

        console.log('Navigating to actualite page:', `/actualite/${infoId}`)

        // Naviguer vers la page de détail de l'information
        router.push(`/actualite/${infoId}`)
      } catch (error) {
        console.error('Error navigating to info:', error)
      }
    }

    // Fonction helper pour naviguer vers un signalement
    const navigateToSignalement = async (signalementId) => {
      if (!signalementId) {
        console.warn('No signalement ID provided for navigation')
        return
      }

      try {
        const router = (await import('@/router')).default
        await router.isReady()
        console.log(
          'Navigating to signalement page:',
          `/signalement/${signalementId}`
        )
        router.push(`/signalement/${signalementId}`)
      } catch (error) {
        console.error('Error navigating to signalement:', error)
      }
    }

    // Fonction helper pour naviguer vers une proposition
    const navigateToProposition = async (propositionId) => {
      if (!propositionId) {
        console.warn('No proposition ID provided for navigation')
        return
      }

      try {
        const router = (await import('@/router')).default
        await router.isReady()
        console.log(
          'Navigating to proposition page:',
          `/proposition/${propositionId}`
        )
        router.push(`/proposition/${propositionId}`)
      } catch (error) {
        console.error('Error navigating to proposition:', error)
      }
    }

    // IMPORTANT: Ajouter TOUS les listeners AVANT l'enregistrement
    // pour s'assurer qu'ils sont prêts même si l'app est ouverte depuis une notification

    // Écouter l'événement d'enregistrement
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, CP token: ' + token.value)

      let finalToken = token.value

      // Sur iOS, le token reçu est le token APNs (hex).
      // On doit utiliser le plugin Firebase Messaging pour obtenir le token d'enregistrement FCM.
      if (Capacitor.getPlatform() === 'ios') {
        try {
          const { token: fcmToken } = await FirebaseMessaging.getToken()
          if (fcmToken) {
            console.log(
              'Firebase Messaging token for iOS retrieved: ' + fcmToken
            )
            finalToken = fcmToken
          }
        } catch (error) {
          console.error('Error getting FCM token on iOS:', error)
          // On garde le token APNs par défaut, mais ça échouera probablement côté serveur
        }
      }

      await savePushToken(finalToken)
    })

    // Écouter les erreurs d'enregistrement
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error))
    })

    // Écouter les notifications reçues quand l'app est au premier plan
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification) => {
        console.log(
          'Push notification received (foreground): ',
          JSON.stringify(notification, null, 2)
        )

        // Extraire les données de la notification
        // Les données peuvent être dans notification.data directement
        const data = notification.data || notification.notification?.data || {}

        console.log('Foreground notification data:', data)

        // Gérer les différents types de notifications
        const notificationType = data?.type || data?.notification_type
        const communeId = data?.commune_id || getCityInfo()?.id || undefined

        if (notificationType === 'signalement') {
          // Notification pour un signalement
          const signalementId = data?.signalement_id || data?.signalementId
          if (signalementId) {
            await navigateToSignalement(signalementId)
          }
        } else if (
          notificationType === 'actualite' ||
          data?.info_id ||
          data?.infoId
        ) {
          // Notification pour une information municipale
          const infoId = data.info_id || data.infoId
          if (infoId) {
            await navigateToInfo(infoId)
          }
        } else if (
          notificationType === 'proposition' ||
          data?.proposition_id ||
          data?.propositionId
        ) {
          // Notification pour une proposition
          const propositionId = data.proposition_id || data.propositionId
          if (propositionId) {
            await navigateToProposition(propositionId)
          }
        }
      }
    )

    // Écouter les notifications cliquées (quand l'app est en arrière-plan ou fermée)
    // Ce listener est CRUCIAL pour gérer les notifications quand l'app est fermée
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification) => {
        console.log(
          'Push notification action performed:',
          JSON.stringify(notification, null, 2)
        )

        // Extraire les données de la notification
        // Le format peut varier selon la plateforme et l'état de l'app
        let data = {}

        // Essayer différents emplacements pour les données
        if (notification.notification?.data) {
          data = notification.notification.data
        } else if (notification.data) {
          data = notification.data
        } else if (notification.notification?.additionalData) {
          data = notification.notification.additionalData
        } else if (notification.additionalData) {
          data = notification.additionalData
        }

        // Pour Android, les valeurs dans data sont toujours des strings
        // Les convertir si nécessaire
        console.log('Notification data extracted (raw):', data)
        console.log('Full notification object keys:', Object.keys(notification))

        // Gérer les différents types de notifications
        const notificationType = data?.type || data?.notification_type
        const communeId = data?.commune_id || getCityInfo()?.id || undefined

        if (notificationType === 'signalement') {
          // Notification pour un signalement
          const signalementId = data?.signalement_id || data?.signalementId
          if (signalementId) {
            trackEvent('notification_clicked', {
              notification_id:
                data?.notification_id
                || data?.campaign_key
                || `signalement_${signalementId}`,
              target_type: 'signalement',
              target_id: String(signalementId),
              commune_id: communeId,
              source: 'push_action'
            })
            console.log(
              'Found signalement_id in notification, navigating to:',
              signalementId
            )
            // Attendre un peu pour que l'app soit complètement initialisée
            setTimeout(async () => {
              await navigateToSignalement(signalementId)
            }, 500)
          } else {
            console.warn(
              'No signalement_id found in notification data. Available keys:',
              Object.keys(data)
            )
          }
        } else if (
          notificationType === 'actualite' ||
          data?.info_id ||
          data?.infoId
        ) {
          // Notification pour une information municipale
          const infoId = data.info_id || data.infoId
          if (infoId) {
            trackEvent('notification_clicked', {
              notification_id:
                data?.notification_id || data?.campaign_key || `actualite_${infoId}`,
              target_type: 'actualite',
              target_id: String(infoId),
              commune_id: communeId,
              source: 'push_action'
            })
            console.log('Found info_id in notification, navigating to:', infoId)
            // Attendre un peu pour que l'app soit complètement initialisée
            setTimeout(async () => {
              await navigateToInfo(infoId)
            }, 500)
          } else {
            console.warn(
              'No info_id found in notification data. Available keys:',
              Object.keys(data)
            )
          }
        } else if (
          notificationType === 'proposition' ||
          data?.proposition_id ||
          data?.propositionId
        ) {
          // Notification pour une proposition
          const propositionId = data.proposition_id || data.propositionId
          if (propositionId) {
            trackEvent('notification_clicked', {
              notification_id:
                data?.notification_id
                || data?.campaign_key
                || `proposition_${propositionId}`,
              target_type: 'proposition',
              target_id: String(propositionId),
              commune_id: communeId,
              source: 'push_action'
            })
            console.log(
              'Found proposition_id in notification, navigating to:',
              propositionId
            )
            setTimeout(async () => {
              await navigateToProposition(propositionId)
            }, 500)
          } else {
            console.warn(
              'No proposition_id found in notification data. Available keys:',
              Object.keys(data)
            )
          }
        } else {
          console.warn(
            'Unknown notification type or missing ID. Available keys:',
            Object.keys(data)
          )
          console.warn('Full notification structure:', notification)
        }
      }
    )

    // Demander la permission
    let permStatus = await PushNotifications.checkPermissions()
    console.log('Current permission status:', permStatus)

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
      console.log('Permission requested, new status:', permStatus)
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permission denied:', permStatus)
      return
    }

    // S'enregistrer pour recevoir les notifications
    // Les listeners doivent être déjà enregistrés avant cet appel
    console.log('Registering for push notifications...')
    await PushNotifications.register()
    console.log('Push notifications registered successfully')

    isInitialized = true

    // Vérifier les notifications en attente au démarrage
    // Cela gère le cas où l'app était fermée et a été ouverte en cliquant sur une notification
    try {
      // Récupérer les notifications qui ont été reçues pendant que l'app était fermée
      const deliveredNotifications =
        await PushNotifications.getDeliveredNotifications()
      console.log('Delivered notifications on startup:', deliveredNotifications)

      // Si des notifications sont en attente, traiter la première
      if (
        deliveredNotifications &&
        deliveredNotifications.notifications &&
        deliveredNotifications.notifications.length > 0
      ) {
        const firstNotification = deliveredNotifications.notifications[0]
        console.log('Processing pending notification:', firstNotification)

        // Extraire les données
        const data =
          firstNotification.data || firstNotification.additionalData || {}

        // Gérer les différents types de notifications
        const notificationType = data?.type || data?.notification_type

        if (notificationType === 'signalement') {
          const signalementId = data?.signalement_id || data?.signalementId
          if (signalementId) {
            console.log(
              'Found signalement_id in pending notification, will navigate after app is ready'
            )
            setTimeout(async () => {
              await navigateToSignalement(signalementId)
            }, 1500)
          }
        } else if (
          notificationType === 'actualite' ||
          data?.info_id ||
          data?.infoId
        ) {
          const infoId = data.info_id || data.infoId
          if (infoId) {
            console.log(
              'Found info_id in pending notification, will navigate after app is ready'
            )
            setTimeout(async () => {
              await navigateToInfo(infoId)
            }, 1500)
          }
        }
      }
    } catch (error) {
      // Pas de notifications en attente, c'est normal
      console.log(
        'No pending notifications found (normal if app was not opened from notification):',
        error.message
      )
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error)
  }
}

/**
 * Génère ou récupère un identifiant utilisateur unique stocké localement
 */
export function getOrCreateUserId() {
  const STORAGE_KEY = 'commune-plus-user-id'
  let userId = localStorage.getItem(STORAGE_KEY)

  if (!userId) {
    // Générer un UUID v4 simple
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
    localStorage.setItem(STORAGE_KEY, userId)
  }

  return userId
}

/**
 * Sauvegarde le token de push notification dans Firestore
 */
async function savePushToken(token) {
  try {
    console.log(
      'Attempting to save push token:',
      token.substring(0, 20) + '...'
    )

    const cityInfo = getCityInfo()
    console.log('City info:', cityInfo)

    const userContact = getUserContact()
    const userEmail = userContact?.email?.toLowerCase() || null
    console.log('User contact email:', userEmail)

    const userId = getOrCreateUserId()
    console.log('User ID:', userId)

    const platform =
      Capacitor.getPlatform() === 'android'
        ? 'android'
        : Capacitor.getPlatform() === 'ios'
          ? 'ios'
          : 'web'
    console.log('Platform:', platform)

    const deviceId = `device_${token.substring(0, 16)}`

    const communeId = cityInfo?.id || null

    if (!communeId) {
      console.warn(
        'No commune selected yet, saving token without commune_id. Will update later.'
      )
    }

    const coll = collection(db(), 'push_token')
    const existingSnap = await getDocs(
      query(coll, where('token', '==', token), limit(1))
    )

    if (!existingSnap.empty) {
      const ref = existingSnap.docs[0].ref
      console.log('Token exists, updating...')
      await updateDoc(ref, {
        user_id: userId,
        email: userEmail,
        commune_id: communeId,
        platform,
        device_id: deviceId,
        is_active: true,
        updated_at: serverTimestamp()
      })
      console.log('Push token updated successfully')
    } else {
      console.log('Token does not exist, creating new one...')
      const tokenData = {
        token,
        user_id: userId,
        email: userEmail,
        commune_id: communeId,
        platform,
        device_id: deviceId,
        is_active: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }
      console.log('Inserting token data:', {
        ...tokenData,
        token: token.substring(0, 20) + '...'
      })
      await addDoc(coll, tokenData)
      console.log('Push token saved successfully')
    }
  } catch (error) {
    console.error('Error saving push token:', error)
    if (error?.stack) {
      console.error('Error stack:', error.stack)
    }
  }
}

/**
 * Désactive le token de push notification (appelé lors de la déconnexion)
 */
export async function disablePushToken() {
  try {
    const userId = getOrCreateUserId()

    if (!userId) {
      return
    }

    const snap = await getDocs(
      query(collection(db(), 'push_token'), where('user_id', '==', userId))
    )
    const batch = writeBatch(db())
    snap.docs.forEach((d) =>
      batch.update(d.ref, { is_active: false, updated_at: serverTimestamp() })
    )
    if (!snap.empty) {
      await batch.commit()
    }
  } catch (error) {
    console.error('Error disabling push token:', error)
  }
}

/**
 * Met à jour le token avec la nouvelle commune sélectionnée
 */
export async function updatePushTokenCommune(communeId) {
  try {
    const userId = getOrCreateUserId()

    if (!userId) {
      console.warn('No user ID found, cannot update push token')
      return
    }

    const snap = await getDocs(
      query(collection(db(), 'push_token'), where('user_id', '==', userId))
    )
    const toUpdate = snap.docs.filter((d) => d.data().is_active !== false)
    if (toUpdate.length === 0) {
      console.log('No active tokens found to update')
      return
    }

    const batch = writeBatch(db())
    toUpdate.forEach((d) =>
      batch.update(d.ref, {
        commune_id: communeId,
        updated_at: serverTimestamp()
      })
    )
    await batch.commit()
    console.log(
      `Updated ${toUpdate.length} push token(s) with commune_id: ${communeId}`
    )
  } catch (error) {
    console.error('Error updating push token commune:', error)
  }
}

/**
 * Met à jour l'email des tokens push pour l'utilisateur courant.
 * À appeler quand l'utilisateur renseigne son email (paramètres, signalement, réservation).
 * @param {string} email - Email de l'utilisateur (sera stocké en minuscules)
 */
export async function updatePushTokenEmail(email) {
  if (!email || typeof email !== 'string') {
    return
  }
  const emailNormalized = email.trim().toLowerCase()
  if (!emailNormalized) {
    return
  }
  try {
    const userId = getOrCreateUserId()
    if (!userId) {
      return
    }
    const snap = await getDocs(
      query(collection(db(), 'push_token'), where('user_id', '==', userId))
    )
    const toUpdate = snap.docs.filter((d) => d.data().is_active !== false)
    const batch = writeBatch(db())
    toUpdate.forEach((d) =>
      batch.update(d.ref, {
        email: emailNormalized,
        updated_at: serverTimestamp()
      })
    )
    if (toUpdate.length > 0) {
      await batch.commit()
      console.log('Push token(s) updated with email')
    }
  } catch (error) {
    console.error('Error updating push token email:', error)
  }
}

/**
 * Réinitialise les push notifications (appelé lors du changement de commune)
 */
export async function resetPushNotifications() {
  isInitialized = false
  await initializePushNotifications()
}
