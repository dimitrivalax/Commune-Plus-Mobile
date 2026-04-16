export function normalizeServiceError(
  error,
  fallback = 'Une erreur est survenue'
) {
  if (!error) return { message: fallback }

  if (typeof error === 'string') {
    return { message: error || fallback }
  }

  if (error instanceof Error) {
    return { message: error.message || fallback }
  }

  if (typeof error === 'object') {
    const message = error.message || error.error_description || error.details
    if (typeof message === 'string' && message.trim().length > 0) {
      return { ...error, message }
    }
  }

  return { message: fallback }
}
