import { Capacitor } from '@capacitor/core'
import posthog from 'posthog-js'
import { getCityInfo } from '@/utils/storage'

const EVENT_PREFIX = 'Commune-Plus-Mobile: '

/** @type {import('posthog-js').BeforeSendFn} */
const beforeSend = (event) => {
  if (!event) {
    return event
  }
  const name = event.event
  if (typeof name !== 'string' || name.startsWith(EVENT_PREFIX)) {
    return event
  }
  return { ...event, event: `${EVENT_PREFIX}${name}` }
}

let posthogInstance = null
const ANALYTICS_DISTINCT_ID_KEY = 'commune-plus-analytics-distinct-id'

function getOrCreateAnalyticsDistinctId() {
  let distinctId = localStorage.getItem(ANALYTICS_DISTINCT_ID_KEY)
  if (!distinctId) {
    distinctId = 'cp_analytics_xxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
    localStorage.setItem(ANALYTICS_DISTINCT_ID_KEY, distinctId)
  }
  return distinctId
}

export function getAnalyticsDistinctId() {
  return getOrCreateAnalyticsDistinctId()
}

/**
 * Build analytics context to attach to every event.
 * RGPD: no direct personal data is included.
 * @returns {object} - { commune: {...}, platform: string }
 */
function getEventContext() {
  const city = getCityInfo()
  let platform = 'web'
  if (typeof window !== 'undefined') {
    const ua = window.navigator?.userAgent || ''
    if (/android/i.test(ua)) platform = 'android'
    if (/iphone|ipad|ipod/i.test(ua)) platform = 'ios'
  }
  return {
    commune:
      city && (city.name || city.id)
        ? {
            commune_id: city.id || undefined,
            commune_name: city.name || undefined,
            commune_postal_code: city.postalCode || undefined
          }
        : {
            commune_id: undefined,
            commune_name: undefined,
            commune_postal_code: undefined
          },
    platform
  }
}

/**
 * Flatten context for PostHog event properties (no nested object to simplify filters in PostHog)
 */
function getFlattenedEventContext() {
  const { commune, platform } = getEventContext()
  return {
    commune_id: commune.commune_id,
    commune_name: commune.commune_name,
    commune_postal_code: commune.commune_postal_code,
    platform,
    app_context: 'mobile'
  }
}

/**
 * Initialize PostHog analytics
 * @param {string} apiKey - PostHog API key
 * @param {string} host - PostHog host URL (e.g., https://app.posthog.com)
 * @param {object} options - Additional PostHog configuration options
 */
export function initPostHog(apiKey, host, options = {}) {
  if (posthogInstance) {
    console.warn('PostHog is already initialized')
    return posthogInstance
  }

  if (!apiKey || !host) {
    console.warn(
      'PostHog API key or host is missing. Analytics will not be initialized.'
    )
    return null
  }

  const { loaded: userLoaded, ...restOptions } = options

  try {
    posthog.init(apiKey, {
      api_host: host,
      autocapture: true,
      capture_pageview: false, // We'll handle pageviews manually via router
      capture_pageleave: true,
      before_send: beforeSend,
      loaded: (ph) => {
        // Super-propriétés : même projet PostHog que le web → filtre par app + OS natif (ios | android | web)
        ph.register({
          app: 'Commune-Plus-Mobile',
          mobile_os: Capacitor.getPlatform()
        })
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully')
        }
        if (typeof userLoaded === 'function') {
          userLoaded(ph)
        }
      },
      ...restOptions
    })

    posthogInstance = posthog
    return posthogInstance
  } catch (error) {
    console.error('Failed to initialize PostHog:', error)
    return null
  }
}

/**
 * Get the PostHog instance
 * @returns {object|null} PostHog instance or null if not initialized
 */
export function getPostHog() {
  return posthogInstance
}

/**
 * Identify a user
 * @param {string} distinctId - Unique user identifier
 * @param {object} properties - User properties
 */
export function identifyUser(distinctId, properties = {}) {
  if (posthogInstance) {
    posthogInstance.identify(distinctId, properties)
  }
}

/**
 * Reset user identification (on logout)
 */
export function resetUser() {
  if (posthogInstance) {
    posthogInstance.reset()
  }
}

/**
 * Track a custom event (commune + platform context added automatically)
 * @param {string} eventName - Name of the event
 * @param {object} properties - Event properties
 */
export function trackEvent(eventName, properties = {}) {
  if (posthogInstance) {
    posthogInstance.capture(eventName, {
      ...getFlattenedEventContext(),
      ...properties
    })
  }
}

/**
 * Track a page view (commune + platform context added automatically)
 * @param {string} pageName - Name of the page
 * @param {object} properties - Additional properties
 */
export function trackPageView(pageName, properties = {}) {
  if (posthogInstance) {
    posthogInstance.capture('$pageview', {
      page_name: pageName,
      ...getFlattenedEventContext(),
      ...properties
    })
  }
}

/**
 * Set user properties
 * @param {object} properties - Properties to set
 */
export function setUserProperties(properties) {
  if (posthogInstance) {
    posthogInstance.setPersonProperties(properties)
  }
}

/**
 * Sync current analytics context from storage to PostHog.
 * Call at app startup and after saving commune in settings.
 */
export function updateUserAndCommuneContext() {
  if (!posthogInstance) return
  const city = getCityInfo()
  const distinctId = getOrCreateAnalyticsDistinctId()
  const analyticsProps = {
    ...(city && (city.name || city.id)
      ? {
          commune_id: city.id || undefined,
          commune_name: city.name || undefined,
          commune_postal_code: city.postalCode || undefined
        }
      : {})
  }
  posthogInstance.identify(distinctId, analyticsProps)
  posthogInstance.setPersonProperties(analyticsProps)
}
