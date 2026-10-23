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
  // true si tu eres quien compra
  isBuyer: boolean
  lastMessage: string | null
  lastMessageAt: Date | null
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  body: string
  // Tal cual llega de la base de datos, para pedir los mensajes anteriores sin perder precision
  createdAt: string
  // Sin estado = ya llego a la base de datos
  status?: 'sending' | 'failed'
  // Llego o se envio con el chat abierto: entra con animacion
  isNew?: boolean
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
