import axios from 'axios'

const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadImageToCloudinary = async (file) => {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
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
        uploadPreset: cloudinaryUploadPreset
      })
      
      if (status === 400) {
        errorMessage = data?.error?.message || 'Requête invalide. Vérifiez votre configuration Cloudinary (cloud_name et upload_preset)'
      } else if (status === 401) {
        errorMessage = 'Non autorisé. Vérifiez votre upload preset'
      } else if (status === 404) {
        errorMessage = 'Cloud name introuvable. Vérifiez votre configuration'
      } else {
        errorMessage = `Erreur Cloudinary (${status}): ${data?.error?.message || 'Erreur inconnue'}`
      }
    } else if (error.request) {
      errorMessage = 'Pas de réponse du serveur Cloudinary. Vérifiez votre connexion internet'
    }
    
    throw new Error(errorMessage)
  }
}

