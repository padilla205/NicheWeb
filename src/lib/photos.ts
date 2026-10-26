import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

const BUCKET = 'photos'

// Cada foto se guarda dos veces: grande para verla completa y chica para las cuadriculas.
// 1600 px se ve nitido en pantallas de celular y laptop; 480 px alcanza para una tarjeta.
const sizes = {
  full: { maxWidthOrHeight: 1600, maxSizeMB: 0.5, initialQuality: 0.82 },
  thumb: { maxWidthOrHeight: 480, maxSizeMB: 0.08, initialQuality: 0.75 },
} as const

type Size = keyof typeof sizes

// WebP pesa cerca de un tercio menos que JPEG con la misma calidad, y conserva lo transparente.
// Si el navegador no sabe crear WebP (Safari), usa JPEG; pero una foto sin fondo (PNG) se queda
// en PNG, porque en JPEG lo transparente saldria negro
async function compress(file: File, size: Size) {
  const options = { ...sizes[size], useWebWorker: true }
  const webp = await imageCompression(file, { ...options, fileType: 'image/webp' })
  if (webp.type === 'image/webp') return webp
  return imageCompression(file, { ...options, fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg' })
}

function extension(file: Blob) {
  return file.type === 'image/webp' ? 'webp' : file.type === 'image/gif' ? 'gif' : file.type === 'image/png' ? 'png' : 'jpg'
}

// "<usuario>/<id>.webp" -> "<usuario>/<id>-thumb.webp"
export function thumbPath(path: string) {
  return path.replace(/(\.\w+)$/, '-thumb$1')
}

// Direccion publica de una foto; con thumb, la version chica (los GIF no tienen version chica)
export function photoUrl(path: string, thumb = false) {
  const finalPath = thumb && !path.endsWith('.gif') ? thumbPath(path) : path
  return supabase.storage.from(BUCKET).getPublicUrl(finalPath).data.publicUrl
}

// Comprime y sube una foto a la carpeta del usuario; devuelve la ruta para guardarla en la tabla.
// Los GIF se suben tal cual para que sigan animados (el bucket los limita a 2 MB).
export async function uploadPhoto(file: File, userId: string) {
  const id = crypto.randomUUID()
  // Un año de cache: el nombre nunca se reutiliza, asi que la foto nunca cambia
  const upload = (path: string, body: Blob) =>
    supabase.storage.from(BUCKET).upload(path, body, { cacheControl: '31536000', contentType: body.type })

  if (file.type === 'image/gif') {
    const path = `${userId}/${id}.gif`
    const { error } = await upload(path, file)
    if (error) throw error
    return path
  }

  const [full, thumb] = await Promise.all([compress(file, 'full'), compress(file, 'thumb')])
  const path = `${userId}/${id}.${extension(full)}`
  const results = await Promise.all([upload(path, full), upload(thumbPath(path), thumb)])
  const failed = results.find((result) => result.error)
  if (failed?.error) throw failed.error
  return path
}

// Borra fotos (y sus versiones chicas) al eliminar una prenda, publicacion o venta
export async function deletePhotos(paths: string[]) {
  if (paths.length === 0) return
  const all = paths.flatMap((path) => (path.endsWith('.gif') ? [path] : [path, thumbPath(path)]))
  const { error } = await supabase.storage.from(BUCKET).remove(all)
  if (error) throw error
}

// Fotos ya guardadas que se cargaron en un formulario (al editar una venta, o al vender una prenda).
// Se recuerda de que ruta vino cada archivo para no comprimirla ni subirla otra vez
const storedPaths = new WeakMap<File, string>()

// Descarga una foto guardada como archivo, para mostrarla en el selector de fotos
export async function fileFromPhoto(path: string) {
  const blob = await fetch(photoUrl(path)).then((response) => response.blob())
  const file = new File([blob], path.split('/').pop() ?? 'foto', { type: blob.type })
  storedPaths.set(file, path)
  return file
}

// Ruta de cada foto para guardarla en una tabla:
// - si ya es de este registro (keep), se deja igual
// - si ya esta guardada en otro lado (una prenda), se copia dentro de Storage, sin perder calidad
// - si es nueva, se comprime y se sube
export async function savePhotos(files: File[], userId: string, keep: string[] = []) {
  return Promise.all(
    files.map(async (file) => {
      const path = storedPaths.get(file)
      if (!path) return uploadPhoto(file, userId)
      if (keep.includes(path)) return path

      const copy = `${userId}/${crypto.randomUUID()}.${path.split('.').pop()}`
      const bucket = supabase.storage.from(BUCKET)
      const copies = [bucket.copy(path, copy)]
      if (!path.endsWith('.gif')) copies.push(bucket.copy(thumbPath(path), thumbPath(copy)))
      const failed = (await Promise.all(copies)).find((result) => result.error)
      if (failed?.error) throw failed.error
      return copy
    }),
  )
}
