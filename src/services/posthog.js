import posthog from 'posthog-js'

let posthogInstance = null

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
    console.warn('PostHog API key or host is missing. Analytics will not be initialized.')
    return null
  }

  try {
    posthog.init(apiKey, {
      api_host: host,
      autocapture: true,
      capture_pageview: false, // We'll handle pageviews manually via router
      capture_pageleave: true,
      loaded: (posthog) => {
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
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {object} properties - Event properties
 */
export function trackEvent(eventName, properties = {}) {
  if (posthogInstance) {
    posthogInstance.capture(eventName, properties)
  }
}

/**
 * Track a page view
 * @param {string} pageName - Name of the page
 * @param {object} properties - Additional properties
 */
export function trackPageView(pageName, properties = {}) {
  if (posthogInstance) {
    posthogInstance.capture('$pageview', {
      page_name: pageName,
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

