const DEFAULT_MAX_SIZE = 1600
const DEFAULT_QUALITY = 0.8

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () =>
      reject(new Error("Impossible de charger l'image pour compression"))
    img.src = dataUrl
  })
}

function computeTargetSize(width, height, maxSize) {
  if (width <= maxSize && height <= maxSize) {
    return { width, height, resized: false }
  }
  const ratio = width / height
  if (width >= height) {
    return { width: maxSize, height: Math.round(maxSize / ratio), resized: true }
  }
  return { width: Math.round(maxSize * ratio), height: maxSize, resized: true }
}

export async function compressImageDataUrl(dataUrl, options = {}) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return dataUrl
  }

  const { maxSize = DEFAULT_MAX_SIZE, quality = DEFAULT_QUALITY } = options

  try {
    const img = await loadImage(dataUrl)
    const { width, height } = computeTargetSize(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxSize
    )

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return dataUrl
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', quality)
  } catch (error) {
    console.warn('Image compression failed, using original:', error)
    return dataUrl
  }
}
