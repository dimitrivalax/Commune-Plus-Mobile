import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { IonicVue } from '@ionic/vue'
import {
  initPostHog,
  trackPageView,
  updateUserAndCommuneContext
} from './services/posthog'
import { initializePushNotifications } from './services/push-notifications'
import {
  initCrashlytics,
  logBreadcrumb,
  logNonFatalError,
  setCrashUserContext
} from './services/crashlytics'

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
  import.meta.env.VITE_POSTHOG_HOST || 'https://t.commune-plus.fr'

if (posthogApiKey) {
  initPostHog(posthogApiKey, posthogHost, {
    // Disable autocapture for mobile apps to reduce noise
    autocapture: false,
    // Enable session recording if needed (can be disabled for privacy)
    disable_session_recording: true,
    // Persist user across sessions
    persistence: 'localStorage+cookie'
  })
  updateUserAndCommuneContext()
}

initCrashlytics()
setCrashUserContext()

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

app.config.errorHandler = (error, instance, info) => {
  logNonFatalError(error, {
    source: 'vue.errorHandler',
    info,
    component: instance?.$options?.name || 'anonymous-component'
  })
}

window.addEventListener('error', (event) => {
  logNonFatalError(event.error || event.message, {
    source: 'window.error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  logNonFatalError(event.reason, {
    source: 'window.unhandledrejection'
  })
})

router.isReady().then(async () => {
  logBreadcrumb('router-ready')
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
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Vérifier les notifications en attente (quand l'app était fermée)
    const pendingNotifications =
      await PushNotifications.getDeliveredNotifications()
    console.log('Pending notifications on app start:', pendingNotifications)

    // Si l'app a été ouverte depuis une notification, les données peuvent être dans le state
    // Capacitor gère cela automatiquement via le listener pushNotificationActionPerformed
    // mais on peut aussi vérifier manuellement
  } catch (error) {
    console.log('Could not check pending notifications:', error)
    logNonFatalError(error, { source: 'app.pendingNotificationsCheck' })
  }

  app.mount('#app')
})
