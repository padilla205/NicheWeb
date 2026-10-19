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
  title: string
  // En pesos, sin centavos
  price: number
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
  // La primera foto es la portada
  photoUrls: string[]
  // TEMPORAL: las ventas de ejemplo no tienen fotos y se dibujan con un degradado
  gradient?: [string, string]
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

// Si la venta coincide con lo buscado (todas las palabras, sin importar acentos) y con los filtros
export function matchesListing(listing: Listing, query: string, filters: ListingFilters) {
  const text = normalizeText(`${listing.title} ${listing.type} ${listing.description}`)
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  if (!words.every((word) => text.includes(word))) return false

  const { minPrice, maxPrice, sizes, conditions, colors, seasons } = filters
  if (minPrice !== undefined && listing.price < minPrice) return false
  if (maxPrice !== undefined && listing.price > maxPrice) return false
  if (sizes.length > 0 && !sizes.includes(normalizeSize(listing.size))) return false
  if (conditions.length > 0 && !conditions.includes(listing.condition)) return false
  if (colors.length > 0 && !colors.some((color) => listing.colors.includes(color))) return false
  if (seasons.length > 0 && !seasons.some((season) => listing.seasons.includes(season))) return false
  return true
}

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

const ana: FeedUser = { username: 'ana.style', name: 'Ana' }
const leo: FeedUser = { username: 'leo_fits', name: 'Leo' }
const sofi: FeedUser = { username: 'sofi', name: 'Sofia' }

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

// Ventas de ejemplo para ver el diseno sin base de datos
export const sampleListings: Listing[] = [
  {
    id: 'l1',
    seller: ana,
    title: 'Chamarra de mezclilla',
    price: 450,
    size: 'M',
    location: { country: 'mx', city: 'guadalajara' },
    condition: 'como-nuevo',
    status: 'disponible',
    type: 'Chamarra',
    description: 'La use dos veces. Sin manchas ni rasgaduras. Entrega en el centro.',
    seasons: ['otono', 'primavera'], colors: ['azul'],
    photoUrls: [],
    gradient: ['#6a85b6', '#bac8e0'],
    createdAt: daysAgo(0.2),
  },
  {
    id: 'l2',
    seller: leo,
    title: 'Tenis blancos clasicos',
    price: 900,
    size: '27',
    location: { country: 'mx', city: 'cdmx' },
    condition: 'usado',
    status: 'disponible',
    type: 'Tenis',
    description: 'Tienen algo de uso pero estan limpios. Incluyen caja.',
    seasons: ['primavera', 'verano', 'otono', 'invierno'], colors: ['blanco'],
    photoUrls: [],
    gradient: ['#e0e0e0', '#bdbdbd'],
    createdAt: daysAgo(1),
  },
  {
    id: 'l3',
    seller: sofi,
    title: 'Vestido negro midi',
    price: 380,
    size: 'S',
    location: { country: 'mx', city: 'guadalajara' },
    condition: 'nuevo',
    status: 'disponible',
    type: 'Vestido',
    description: 'Nuevo con etiqueta, no me quedo. Tela ligera, ideal para eventos.',
    seasons: ['primavera', 'verano'], colors: ['negro'],
    photoUrls: [],
    gradient: ['#434343', '#000000'],
    createdAt: daysAgo(2),
  },
  {
    id: 'l4',
    seller: leo,
    title: 'Jersey del America',
    price: 650,
    size: 'L',
    location: { country: 'mx', city: 'cdmx' },
    condition: 'como-nuevo',
    status: 'disponible',
    type: 'Jersey de futbol',
    description: 'Temporada pasada. Lavado a mano, los numeros estan completos.',
    seasons: ['verano'], colors: ['azul', 'blanco'],
    team: 'america',
    photoUrls: [],
    gradient: ['#4facfe', '#00f2fe'],
    createdAt: daysAgo(3),
  },
  {
    id: 'l5',
    seller: ana,
    title: 'Bolsa de piel cafe',
    price: 1200,
    size: 'Unitalla',
    location: { country: 'mx', city: 'monterrey' },
    condition: 'usado',
    status: 'disponible',
    type: 'Bolsa',
    description: 'Piel genuina, el broche funciona perfecto. Tiene un pequeno raspon en una esquina.',
    seasons: ['otono', 'invierno'], colors: ['cafe'],
    photoUrls: [],
    gradient: ['#c79081', '#dfa579'],
    createdAt: daysAgo(5),
  },
  {
    id: 'l6',
    seller: sofi,
    title: 'Sudadera oversize',
    price: 300,
    size: 'XL',
    location: { country: 'mx', city: 'cdmx' },
    condition: 'como-nuevo',
    status: 'disponible',
    type: 'Sudadera',
    description: 'Muy comoda y calientita. Color verde olivo.',
    seasons: ['otono', 'invierno'], colors: ['verde'],
    photoUrls: [],
    gradient: ['#93a5cf', '#e4efe9'],
    createdAt: daysAgo(6),
  },
]
