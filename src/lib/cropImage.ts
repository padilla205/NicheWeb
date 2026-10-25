import type { Area } from 'react-easy-crop'

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// Dibuja la foto girada en un lienzo y de ahi corta el pedazo elegido. Devuelve una foto nueva
// (despues pasa por la compresion de siempre al subirse)
export async function cropImage(file: File, crop: Area, rotation: number) {
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    const radians = (rotation * Math.PI) / 180
    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))
    // Tamano de la foto ya girada (crece para que no se corten las esquinas)
    const rotatedWidth = image.naturalWidth * cos + image.naturalHeight * sin
    const rotatedHeight = image.naturalWidth * sin + image.naturalHeight * cos

    const rotated = document.createElement('canvas')
    rotated.width = rotatedWidth
    rotated.height = rotatedHeight
    const rotatedContext = rotated.getContext('2d')!
    rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2)
    rotatedContext.rotate(radians)
    rotatedContext.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)

    const result = document.createElement('canvas')
    result.width = Math.round(crop.width)
    result.height = Math.round(crop.height)
    result.getContext('2d')!.drawImage(rotated, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

    // PNG y WebP conservan la transparencia; lo demas sale como JPG
    const type = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg'
    const blob = await new Promise<Blob | null>((resolve) => result.toBlob(resolve, type, 0.95))
    if (!blob) throw new Error('No se pudo editar la foto')
    const name = file.name.replace(/\.\w+$/, '') + (type === 'image/jpeg' ? '.jpg' : type === 'image/png' ? '.png' : '.webp')
    return new File([blob], name, { type })
  } finally {
    URL.revokeObjectURL(url)
  }
}
