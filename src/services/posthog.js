import posthog from 'posthog-js'
import { getUserContact } from '@/utils/storage'
import { getCityInfo } from '@/utils/storage'

let posthogInstance = null

/**
 * Build context (person + commune) to attach to every event
 * @returns {object} - { person: {...}, commune: {...} } for event properties
 */
function getEventContext() {
  const contact = getUserContact()
  const city = getCityInfo()
  return {
    // Person (sans données sensibles en clair dans les props d'event si besoin de restreindre)
    person: contact
      ? {
          has_contact: true,
          first_name: contact.firstName || undefined,
          last_name: contact.lastName || undefined,
          email: contact.email || undefined
        }
      : { has_contact: false },
    // Commune
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
          }
  }
}

/**
 * Flatten context for PostHog event properties (no nested object to simplify filters in PostHog)
 */
function getFlattenedEventContext() {
  const { person, commune } = getEventContext()
  return {
    ...(person.has_contact
      ? {
          person_has_contact: true,
          person_first_name: person.first_name,
          person_last_name: person.last_name,
          person_email: person.email
        }
      : { person_has_contact: false }),
    commune_id: commune.commune_id,
    commune_name: commune.commune_name,
    commune_postal_code: commune.commune_postal_code
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

  try {
    posthog.init(apiKey, {
      api_host: host,
      autocapture: true,
      capture_pageview: false, // We'll handle pageviews manually via router
      capture_pageleave: true,
      loaded: () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded successfully')
        }
      },
      ...options
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
 * Track a custom event (person + commune context added automatically)
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
 * Track a page view (person + commune context added automatically)
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
 * Sync current person and commune from storage to PostHog (identify + person properties).
 * Call at app startup and after saving contact/commune in settings.
 */
export function updateUserAndCommuneContext() {
  if (!posthogInstance) return
  const contact = getUserContact()
  const city = getCityInfo()
  const distinctId = contact?.email?.trim() || posthogInstance.get_distinct_id()
  const personProps = {
    ...(contact
      ? {
          email: contact.email || undefined,
          first_name: contact.firstName || undefined,
          last_name: contact.lastName || undefined,
          has_contact: true
        }
      : { has_contact: false }),
    ...(city && (city.name || city.id)
      ? {
          commune_id: city.id || undefined,
          commune_name: city.name || undefined,
          commune_postal_code: city.postalCode || undefined
        }
      : {})
  }
  posthogInstance.identify(distinctId, personProps)
  posthogInstance.setPersonProperties(personProps)
}
