import type { Season } from '@/lib/clothing'
import type { FeedUser } from '@/lib/feed'
import type { UserLocation } from '@/lib/locations'
import { normalizeText } from '@/lib/text'

export const listingConditions = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como-nuevo', label: 'Como nuevo' },
  { value: 'usado', label: 'Usado' },
] as const

export type ListingCondition = (typeof listingConditions)[number]['value']

// Apartada: alguien ya la va a comprar, pero aun se ve en la lista. Vendida: deja de aparecer
export const listingStatuses = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'apartada', label: 'Apartada' },
  { value: 'vendida', label: 'Vendida' },
] as const

export type ListingStatus = (typeof listingStatuses)[number]['value']

export function getStatusLabel(status: ListingStatus) {
  return listingStatuses.find((s) => s.value === status)?.label ?? status
}

// Una prenda a la venta en el marketplace
export type Listing = {
  id: string
  seller: FeedUser
  sellerId: string
  title: string
  // En pesos, sin centavos
  price: number
  // Precio antes de la rebaja (lo pone la base de datos al bajar el precio)
  previousPrice?: number
  size: string
  // Donde se entrega la prenda (el trato es en persona)
  location: UserLocation
  // Punto o zona exacta en el mapa (opcional)
  delivery?: Delivery
  condition: ListingCondition
  status: ListingStatus
  // Texto libre: "Chamarra de piel", "Tenis", etc.
  type: string
  // Mismas caracteristicas que una prenda del closet
  seasons: Season[]
  // Colores de la lista ("azul") o personalizados ("#1e90ff")
  colors: string[]
  // Solo en jerseys de futbol (valor de la lista de equipos)
  team?: string
  description: string
  // Rutas en Storage y direcciones de las fotos; la primera es la portada
  photoPaths: string[]
  photoUrls: string[]
  // Version chica de la portada, para las tarjetas
  thumbUrl: string
  createdAt: Date
}

// Lugar de entrega en el mapa: con radio es una zona ("entrego a X km de aqui"); sin radio, un punto de encuentro
export type Delivery = {
  lat: number
  lng: number
  radiusKm?: number
}

// Con tipo libre, el campo de equipo aparece si el texto suena a jersey de futbol
export function isJerseyType(type: string) {
  const text = normalizeText(type)
  return text.includes('jersey') || text.includes('futbol')
}

// Filtros del marketplace; una lista vacia o un precio sin escribir no filtra
export type ListingFilters = {
  minPrice?: number
  maxPrice?: number
  sizes: string[]
  conditions: ListingCondition[]
  colors: string[]
  seasons: Season[]
}

export const emptyFilters: ListingFilters = { sizes: [], conditions: [], colors: [], seasons: [] }

export function countActiveFilters(filters: ListingFilters) {
  return (
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    filters.sizes.length +
    filters.conditions.length +
    filters.colors.length +
    filters.seasons.length
  )
}

// Las tallas se comparan sin importar mayusculas ni espacios ("m" = "M ")
export function normalizeSize(size: string) {
  return size.trim().toUpperCase()
}

export const listingSorts = [
  { value: 'recientes', label: 'Mas recientes' },
  { value: 'precio-menor', label: 'Menor precio' },
  { value: 'precio-mayor', label: 'Mayor precio' },
  { value: 'cercanos', label: 'Mas cercanos' },
] as const

export type ListingSort = (typeof listingSorts)[number]['value']

export function getConditionLabel(condition: ListingCondition) {
  return listingConditions.find((c) => c.value === condition)?.label ?? condition
}

const priceFormat = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

// 1200 -> "$1,200"
export function formatPrice(price: number) {
  return priceFormat.format(price)
}
