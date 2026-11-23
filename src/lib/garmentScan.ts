import type { ClothingType } from '@/lib/clothing'

// Lo que la IA dice de una prenda a partir de sus fotos (frente, atras y etiqueta)
export type GarmentScan = {
  // Nombre del modelo, tal como se conoce en reventa
  model: string
  brand: string
  // Año en que salio, si se sabe; si no, solo la decada
  year?: number
  decade: number
  type: ClothingType
  colors: string[]
  description: string
  // Estilo o escena a la que pertenece (streetwear, futbol retro, outdoor...)
  style: string
  rarity: 'Comun' | 'Poco comun' | 'Rara'
  // Lo que se lee en la etiqueta
  tag: { size?: string; material?: string; madeIn?: string }
  // Que tan segura esta la IA de haber acertado el modelo
  confidence: 'alta' | 'media' | 'baja'
  price: {
    min: number
    max: number
    // reventa: salio de ventas reales que encontro; estimado: no encontro ventas y es un aproximado
    basis: 'reventa' | 'estimado'
    // Cuantas ventas encontro (solo con basis reventa)
    found?: number
    sources: { title: string; url: string }[]
    // Precio tipico de reventa en cada uno de los ultimos 5 años (para la grafica)
    history: { year: number; price: number }[]
  }
  // Solo mientras no esta conectada la IA: los datos son inventados para ver la pantalla
  example?: boolean
}

// ponytail: datos de ejemplo para disenar la pantalla. Se reemplaza por la llamada a la funcion de
// Supabase que le pasa las fotos a Claude cuando exista la cuenta de la API
const examples: GarmentScan[] = [
  {
    model: 'Jersey Xolos de Tijuana local 2012',
    brand: 'Nike',
    year: 2012,
    decade: 2010,
    type: 'jerseys-futbol',
    colors: ['negro', 'rojo'],
    description: 'Jersey local negro con franja roja al frente y patrocinador en el pecho. Corte de los primeros años del club en primera division.',
    style: 'Futbol retro',
    rarity: 'Poco comun',
    tag: { size: 'M', material: 'Poliester', madeIn: 'Tailandia' },
    confidence: 'alta',
    price: {
      min: 700,
      max: 1100,
      basis: 'reventa',
      found: 5,
      sources: [],
      history: [
        { year: 2022, price: 520 },
        { year: 2023, price: 610 },
        { year: 2024, price: 590 },
        { year: 2025, price: 780 },
        { year: 2026, price: 900 },
      ],
    },
    example: true,
  },
  {
    model: 'Sudadera con capucha basica',
    brand: 'Sin marca visible',
    decade: 2020,
    type: 'sudaderas-capucha',
    colors: ['negro'],
    description: 'Sudadera lisa con capucha y bolsa canguro. No se encontro el modelo exacto: los datos son una estimacion por el corte y la tela.',
    style: 'Casual',
    rarity: 'Comun',
    tag: { size: 'L' },
    confidence: 'baja',
    price: {
      min: 150,
      max: 300,
      basis: 'estimado',
      sources: [],
      history: [
        { year: 2022, price: 280 },
        { year: 2023, price: 260 },
        { year: 2024, price: 250 },
        { year: 2025, price: 230 },
        { year: 2026, price: 220 },
      ],
    },
    example: true,
  },
]
// Identifica la prenda. Hoy devuelve un ejemplo tras una espera: segun la foto de portada sale el caso
// con ventas encontradas o el de precio estimado, siempre el mismo para la misma foto
export async function scanGarment(photos: File[]): Promise<GarmentScan> {
  if (photos.length === 0) throw new Error('Sin fotos')
  await new Promise((resolve) => setTimeout(resolve, 2600))
  return examples[photos[0].size % examples.length]
}

// "MX$700 – 1,100"
const money = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })
export function formatPriceRange(min: number, max: number) {
  return `MX$${money.format(min)} – ${money.format(max)}`
}
