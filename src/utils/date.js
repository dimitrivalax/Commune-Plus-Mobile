/**
 * Utilitaires pour le formatage des dates
 */

export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (timeString) => {
  if (!timeString) return ''
  // Si c'est déjà au format HH:mm, le retourner tel quel
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString
  }
  // Si c'est au format ISO (avec T), extraire la partie time
  if (timeString.includes('T')) {
    return timeString.split('T')[1]?.substring(0, 5) || timeString
  }
  return timeString
}

export const formatDateForDB = (dateString) => {
  if (!dateString) return ''
  // Si c'est déjà au format YYYY-MM-DD, le retourner tel quel
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString
  }
  // Si c'est au format ISO, extraire la partie date
  if (dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  // Sinon, essayer de parser et formater
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}


