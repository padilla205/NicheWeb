import { type ClothingType, clothingZones } from '@/lib/clothing'

// Lo que la IA dice de una prenda a partir de sus fotos (frente, atras y etiqueta). Los datos que no
// pudo confirmar quedan vacios: la pantalla solo muestra lo que si sabe
export type GarmentScan = {
  // Nombre del modelo, tal como se conoce en reventa
  model: string
  brand?: string
  // Año en que salio, si se sabe; si no, solo la decada
  year?: number
  decade?: number
  type?: ClothingType
  colors: string[]
  description: string
  // Estilo o escena a la que pertenece (streetwear, futbol retro, outdoor...)
  style?: string
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
    // Paginas que la IA cito al buscar en Google (las da Google, no las escribe la IA)
    sources: { title: string; url: string }[]
    // Precio tipico de reventa en cada uno de los ultimos 5 años (para la grafica)
    history: { year: number; price: number }[]
  }
}

// Respuesta cruda de la funcion escanear-prenda (ver supabase/functions/escanear-prenda)
export type RawScan = {
  identified: boolean
  model: string
  brand: string
  year: number
  decade: number
  type: string
  colors: string[]
  description: string
  style: string
  rarity: GarmentScan['rarity']
  tag: { size: string; material: string; madeIn: string }
  confidence: GarmentScan['confidence']
  price: { min: number; max: number; basis: GarmentScan['price']['basis']; found: number; history: { year: number; price: number }[] }
}

const typeValues = new Set<string>(clothingZones.flatMap((zone) => zone.types.map((t) => t.value)))
const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined)
const positive = (value: unknown) => (typeof value === 'number' && value > 0 ? Math.round(value) : undefined)

// Limpia lo que devolvio la IA: lo vacio o fuera de las listas de Niche se descarta
export function toGarmentScan(raw: RawScan, sources: GarmentScan['price']['sources']): GarmentScan {
  const min = positive(raw.price?.min) ?? 0
  const max = Math.max(positive(raw.price?.max) ?? 0, min)
  const history = (raw.price?.history ?? [])
    .filter((point) => positive(point.year) && positive(point.price))
    .sort((a, b) => a.year - b.year)
  return {
    model: text(raw.model) ?? 'Prenda sin identificar',
    brand: text(raw.brand),
    year: positive(raw.year),
    decade: positive(raw.decade),
    type: typeValues.has(raw.type) ? (raw.type as ClothingType) : undefined,
    colors: (raw.colors ?? []).slice(0, 3),
    description: text(raw.description) ?? '',
    style: text(raw.style),
    rarity: raw.rarity ?? 'Comun',
    tag: { size: text(raw.tag?.size), material: text(raw.tag?.material), madeIn: text(raw.tag?.madeIn) },
    confidence: raw.confidence ?? 'baja',
    price: {
      min,
      max,
      // Sin precio no puede presumir de ventas reales
      basis: min > 0 && raw.price?.basis === 'reventa' ? 'reventa' : 'estimado',
      found: positive(raw.price?.found),
      sources,
      history,
    },
  }
}
