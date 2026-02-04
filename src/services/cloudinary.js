import axios from 'axios'

const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadImageToCloudinary = async (file) => {
  // Vérifier que les credentials sont présents
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    console.error('Cloudinary configuration missing:', {
      cloudName: cloudinaryCloudName || 'MISSING',
      uploadPreset: cloudinaryUploadPreset || 'MISSING'
    })
    throw new Error('Cloudinary credentials are missing. Please check your .env file.')
  }

  // Vérifier que le fichier est valide
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided for upload')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', cloudinaryUploadPreset)
  // Note: cloud_name ne doit PAS être dans le FormData, il est déjà dans l'URL

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Timeout de 60 secondes pour les gros fichiers
        timeout: 60000
      }
    )
    
    if (!response.data || !response.data.secure_url) {
      throw new Error('Invalid response from Cloudinary')
    }
    
    return response.data.secure_url
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error)
    
    // Améliorer le message d'erreur
    let errorMessage = 'Erreur lors de l\'upload de l\'image'
    
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status
      const data = error.response.data
      
      console.error('Cloudinary error details:', {
        status,
        data,
        cloudName: cloudinaryCloudName,
        uploadPreset: cloudinaryUploadPreset,
        url: `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`
      })
      
      // Extraire le message d'erreur de Cloudinary
      let cloudinaryMessage = ''
      if (data?.error?.message) {
        cloudinaryMessage = data.error.message
      } else if (typeof data === 'string') {
        cloudinaryMessage = data
      } else if (data?.message) {
        cloudinaryMessage = data.message
      }
      
      if (status === 400) {
        if (cloudinaryMessage.toLowerCase().includes('upload preset') || 
            cloudinaryMessage.toLowerCase().includes('preset not found')) {
          errorMessage = `Upload preset non trouvé: "${cloudinaryUploadPreset}". Vérifiez que le preset existe dans Cloudinary et qu'il est de type "Unsigned".`
        } else if (cloudinaryMessage.toLowerCase().includes('cloud name')) {
          errorMessage = `Cloud name invalide: "${cloudinaryCloudName}". Vérifiez votre configuration.`
        } else {
          errorMessage = cloudinaryMessage || 'Requête invalide. Vérifiez votre configuration Cloudinary (cloud_name et upload_preset)'
        }
      } else if (status === 401) {
        errorMessage = 'Non autorisé. Vérifiez que votre upload preset est de type "Unsigned" ou que vous avez les bonnes permissions.'
      } else if (status === 404) {
        errorMessage = `Cloud name introuvable: "${cloudinaryCloudName}". Vérifiez votre configuration.`
      } else {
        errorMessage = `Erreur Cloudinary (${status}): ${cloudinaryMessage || 'Erreur inconnue'}`
      }
    } else if (error.request) {
      errorMessage = 'Pas de réponse du serveur Cloudinary. Vérifiez votre connexion internet'
    } else {
      errorMessage = error.message || 'Erreur inconnue lors de l\'upload'
    }
    
    throw new Error(errorMessage)
  }
}

