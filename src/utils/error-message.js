export function getErrorMessage(error, fallback = 'Une erreur est survenue.') {
  if (!error) return fallback

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage =
      error.message || error.error_description || error.details
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage
    }
  }

  return fallback
}
