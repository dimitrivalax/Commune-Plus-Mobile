import { Capacitor } from '@capacitor/core'
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics'
import { getCityInfo } from '@/utils/storage'
import { getErrorMessage } from '@/utils/error-message'
import { getAnalyticsDistinctId } from './posthog'

const SENSITIVE_KEY_PATTERN = /(email|token|password|authorization|secret|key)/i

function isNativeCrashlyticsAvailable() {
  return Capacitor.isNativePlatform()
}

function normalizeValue(value) {
  if (value === null || value === undefined) return 'n/a'
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value.slice(0, 256)
  return JSON.stringify(value).slice(0, 256)
}

function sanitizeContext(context = {}) {
  if (!context || typeof context !== 'object') {
    return {}
  }

  return Object.entries(context).reduce((acc, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      return acc
    }
    acc[key] = normalizeValue(value)
    return acc
  }, {})
}

async function setCustomKey(key, value, type = 'string') {
  await FirebaseCrashlytics.setCustomKey({
    key,
    value,
    type
  })
}

export async function initCrashlytics() {
  if (!isNativeCrashlyticsAvailable()) return

  try {
    await FirebaseCrashlytics.setEnabled({ enabled: true })
    const { crashed } = await FirebaseCrashlytics.didCrashOnPreviousExecution()

    if (crashed) {
      await FirebaseCrashlytics.log({
        message: 'App crashed during previous execution.'
      })
    }
  } catch (error) {
    console.warn('Crashlytics init failed:', error)
  }
}

export async function setCrashUserContext(extraContext = {}) {
  if (!isNativeCrashlyticsAvailable()) return

  try {
    const city = getCityInfo()
    const analyticsDistinctId = getAnalyticsDistinctId()
    const platform = Capacitor.getPlatform()

    if (analyticsDistinctId) {
      await FirebaseCrashlytics.setUserId({ userId: analyticsDistinctId })
    }

    await setCustomKey('app_context', 'mobile')
    await setCustomKey('platform', platform)
    await setCustomKey('commune_id', city?.id ? String(city.id) : 'n/a')
    await setCustomKey('commune_name', city?.name || 'n/a')
    await setCustomKey(
      'commune_postal_code',
      city?.postalCode ? String(city.postalCode) : 'n/a'
    )

    const sanitized = sanitizeContext(extraContext)
    await Promise.all(
      Object.entries(sanitized).map(([key, value]) => setCustomKey(key, value))
    )
  } catch (error) {
    console.warn('Crashlytics context setup failed:', error)
  }
}

export async function logBreadcrumb(message, data = {}) {
  if (!isNativeCrashlyticsAvailable()) return

  try {
    const context = sanitizeContext(data)
    const serializedContext =
      Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : ''
    await FirebaseCrashlytics.log({
      message: `${message}${serializedContext}`.slice(0, 1024)
    })
  } catch (error) {
    console.warn('Crashlytics breadcrumb failed:', error)
  }
}

export async function logNonFatalError(error, context = {}) {
  if (!isNativeCrashlyticsAvailable()) return

  const message = getErrorMessage(error, 'Erreur non fatale')
  const sanitizedContext = sanitizeContext(context)
  const keysAndValues = Object.entries(sanitizedContext).map(
    ([key, value]) => ({
      key,
      value,
      type: 'string'
    })
  )

  try {
    await FirebaseCrashlytics.recordException({
      message,
      keysAndValues
    })
  } catch (recordError) {
    console.warn('Crashlytics recordException failed:', recordError)
  }
}

export async function triggerNativeCrashTest() {
  if (!isNativeCrashlyticsAvailable()) return
  await FirebaseCrashlytics.crash({ message: 'Manual Crashlytics test crash' })
}
