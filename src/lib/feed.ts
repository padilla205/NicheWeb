import type { Season } from '@/lib/clothing'
import type { Outfit } from '@/lib/outfits'

export type FeedUser = {
  username: string
  name: string
  // Sin foto de perfil se ve su inicial
  avatarUrl?: string
}

export type PostComment = {
  id: string
  authorId: string
  author: FeedUser
  // Puede ir vacio si el comentario solo lleva imagen
  text: string
  // Foto o GIF adjunto (opcional)
  imageUrl?: string
  createdAt: Date
  likes: number
  likedByMe: boolean
  // Si es una respuesta: el comentario principal bajo el que se muestra y a quien le responde
  reply?: { parentId: string; toUserId: string; toUsername: string }
}

export type Post = {
  id: string
  authorId: string
  author: FeedUser
  caption: string
  // Rutas en Storage (para borrarlas) y sus direcciones; la primera es la portada
  photoPaths: string[]
  photoUrls: string[]
  // Ancho entre alto de la portada; en la cuadricula cada publicacion conserva su forma
  aspect: number
  seasons: Season[]
  // El outfit publicado; si no hay fotos propias, la publicacion se ve como el outfit armado
  outfit?: Outfit
  createdAt: Date
  likes: number
  likedByMe: boolean
  // Si la republicaste en tu perfil (pestana Compartidos)
  sharedByMe: boolean
  commentCount: number
}

// "hace 5 min", "hace 2 h", "hace 3 d"
export function formatTimeAgo(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}
