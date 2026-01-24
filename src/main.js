import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'
import { initPostHog, trackPageView } from './services/posthog'
import { initializePushNotifications } from './services/push-notifications'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'
import './theme/custom.css'
// import { applyCityTheme } from './theme/city-theme'

// Appliquer le thème de la ville
// applyCityTheme()

// Initialize PostHog
const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY
const posthogHost =
  import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'

if (posthogApiKey) {
  initPostHog(posthogApiKey, posthogHost, {
    // Disable autocapture for mobile apps to reduce noise
    autocapture: false,
    // Enable session recording if needed (can be disabled for privacy)
    disable_session_recording: true,
    // Persist user across sessions
    persistence: 'localStorage+cookie'
  })
}

// Track page views
router.afterEach((to, from) => {
  if (posthogApiKey) {
    trackPageView(to.name || to.path, {
      path: to.path,
      fullPath: to.fullPath,
      params: to.params,
      query: to.query,
      from_path: from.path,
      from_name: from.name
    })
  }
})

const app = createApp(App).use(IonicVue).use(router)

router.isReady().then(async () => {
  // Track initial page view when router is ready
  if (posthogApiKey) {
    const route = router.currentRoute.value
    trackPageView(route.name || route.path, {
      path: route.path,
      fullPath: route.fullPath,
      params: route.params,
      query: route.query,
      is_initial_load: true
    })
  }
  
  // Initialize push notifications AVANT de monter l'app
  // pour s'assurer que les listeners sont prêts si l'app est ouverte depuis une notification
  await initializePushNotifications()
  
  // Vérifier si l'app a été ouverte depuis une notification
  // Cela doit être fait après l'initialisation des notifications
  try {
    const { App } = await import('@capacitor/app')
    const { PushNotifications } = await import('@capacitor/push-notifications')

    
    // Vérifier les notifications en attente (quand l'app était fermée)
    const pendingNotifications = await PushNotifications.getDeliveredNotifications()
    console.log('Pending notifications on app start:', pendingNotifications)
    
    // Si l'app a été ouverte depuis une notification, les données peuvent être dans le state
    // Capacitor gère cela automatiquement via le listener pushNotificationActionPerformed
    // mais on peut aussi vérifier manuellement
  } catch (error) {
    console.log('Could not check pending notifications:', error)
  }
  
  app.mount('#app')
})
