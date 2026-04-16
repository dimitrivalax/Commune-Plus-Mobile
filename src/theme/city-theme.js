/**
 * Script pour appliquer la couleur de la ville au thème Ionic
 */
import { cityConfig } from '@/config/city'

// Fonction pour convertir hex en RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

// Fonction pour générer les nuances de couleur
function generateShadeTint(rgb, shadePercent = 0.15, tintPercent = 0.15) {
  const shade = {
    r: Math.round(rgb.r * (1 - shadePercent)),
    g: Math.round(rgb.g * (1 - shadePercent)),
    b: Math.round(rgb.b * (1 - shadePercent))
  }
  const tint = {
    r: Math.round(rgb.r + (255 - rgb.r) * tintPercent),
    g: Math.round(rgb.g + (255 - rgb.g) * tintPercent),
    b: Math.round(rgb.b + (255 - rgb.b) * tintPercent)
  }
  return { shade, tint }
}

// Appliquer les couleurs de la ville
export function applyCityTheme() {
  const rgb = hexToRgb(cityConfig.primaryColor)
  if (!rgb) return

  const { shade, tint } = generateShadeTint(rgb)
  const root = document.documentElement

  root.style.setProperty('--ion-color-primary', cityConfig.primaryColor)
  root.style.setProperty(
    '--ion-color-primary-rgb',
    `${rgb.r}, ${rgb.g}, ${rgb.b}`
  )
  root.style.setProperty(
    '--ion-color-primary-shade',
    `rgb(${shade.r}, ${shade.g}, ${shade.b})`
  )
  root.style.setProperty(
    '--ion-color-primary-tint',
    `rgb(${tint.r}, ${tint.g}, ${tint.b})`
  )
}
