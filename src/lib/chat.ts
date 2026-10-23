import type { FeedUser } from '@/lib/feed'
import type { ListingStatus } from '@/lib/marketplace'

// La prenda de la que se habla en un chat
export type ChatListing = {
  id: string
  title: string
  price: number
  status: ListingStatus
  thumbUrl: string
}

export type Conversation = {
  id: string
  // null si la venta ya no se puede ver
  listing: ChatListing | null
  // La otra persona del chat
  other: FeedUser
  otherId: string
  // true si tu eres quien compra
  isBuyer: boolean
  lastMessage: string | null
  lastMessageAt: Date | null
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  // Puede ir vacio si el mensaje solo lleva imagen
  body: string
  // Foto o GIF: completa y en miniatura (mientras se sube, las dos son la foto local)
  imageUrl?: string
  thumbUrl?: string
  // Ruta en Storage, para borrar la foto si se borra el mensaje
  imagePath?: string
  // La foto elegida, guardada mientras se sube para poder reintentar
  file?: File
  editedAt?: string
  // Borrado: se ve como "Mensaje eliminado"
  deleted?: boolean
  // Una por persona; sin cargar todavia si llego por Realtime
  reactions?: Reaction[]
  // Publicacion o prenda compartida en el mensaje
  shared?: SharedContent
  // Tal cual llega de la base de datos, para pedir los mensajes anteriores sin perder precision
  createdAt: string
  // Sin estado = ya llego a la base de datos
  status?: 'sending' | 'failed'
  // Llego o se envio con el chat abierto: entra con animacion
  isNew?: boolean
}

export type Reaction = { userId: string; emoji: ReactionEmoji }

// Lo que se ve de una publicacion o prenda compartida en un chat. Sin id: ya no esta disponible
export type SharedContent = {
  type: 'post' | 'item'
  id?: string
  title: string
  subtitle: string
  thumbUrl?: string
}

export function sharedLink(shared: SharedContent) {
  return shared.type === 'post' ? `/p/${shared.id}` : `/prenda/${shared.id}`
}

// Las 4 reacciones; se ven con los emojis del sistema de cada quien
export const reactionEmojis = ['😂', '👍', '👎', '😢'] as const
export type ReactionEmoji = (typeof reactionEmojis)[number]

// Minutos para editar o borrar un mensaje (la base de datos aplica el mismo limite)
export const EDIT_MINUTES = 10

export function canChangeMessage(message: ChatMessage) {
  return !message.deleted && !message.status && Date.now() - new Date(message.createdAt).getTime() < EDIT_MINUTES * 60_000
}

// Mensajes listos para tocar en un chat nuevo
export const quickReplies = ['Sigue disponible?', 'Cual es el precio final?', 'Donde lo entregas?']

export function formatMessageTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

// "Hoy", "Ayer" o "12 oct" para separar los mensajes por dia
export function formatMessageDay(createdAt: string) {
  const date = new Date(createdAt)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')
}
