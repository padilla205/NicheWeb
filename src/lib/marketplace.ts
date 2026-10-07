import type { ClothingType, Season } from '@/lib/clothing'
import type { FeedUser } from '@/lib/feed'
import type { UserLocation } from '@/lib/locations'

export const listingConditions = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como-nuevo', label: 'Como nuevo' },
  { value: 'usado', label: 'Usado' },
] as const

export type ListingCondition = (typeof listingConditions)[number]['value']

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
  condition: ListingCondition
  type: ClothingType
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
    type: 'chamarras',
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
    type: 'tenis',
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
    type: 'vestidos',
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
    type: 'jerseys-futbol',
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
    type: 'bolsas',
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
    type: 'sudaderas',
    description: 'Muy comoda y calientita. Color verde olivo.',
    seasons: ['otono', 'invierno'], colors: ['verde'],
    photoUrls: [],
    gradient: ['#93a5cf', '#e4efe9'],
    createdAt: daysAgo(6),
  },
]
