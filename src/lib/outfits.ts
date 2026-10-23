import type { ClosetItem, ClothingType, Season } from '@/lib/clothing'
import type { FeedUser } from '@/lib/feed'

// Lugar de cada prenda en el outfit. "completo" (vestido, jumpsuit...) cubre arriba y abajo
export type OutfitSlot = 'cabeza' | 'chamarra' | 'arriba' | 'completo' | 'abajo' | 'zapatos' | 'accesorio'

// Los que se pueden agregar o quitar; los demas siempre van
export type OptionalSlot = 'cabeza' | 'chamarra' | 'accesorio'

export const slotLabels: Record<OutfitSlot, string> = {
  cabeza: 'Cabeza',
  chamarra: 'Chamarra',
  arriba: 'Arriba',
  completo: 'Completo',
  abajo: 'Abajo',
  zapatos: 'Zapatos',
  accesorio: 'Accesorio',
}

const slotTypes: Record<OutfitSlot, readonly ClothingType[]> = {
  cabeza: ['gorras', 'gorros', 'sombreros', 'boinas', 'viseras', 'bandanas', 'diademas', 'pasamontanas'],
  chamarra: [
    'chamarras', 'chaquetas', 'chaquetas-mezclilla', 'chaquetas-cuero', 'bombers', 'chamarras-acolchadas',
    'parkas', 'sobrecamisas', 'kimonos', 'blazers', 'abrigos', 'gabardinas', 'impermeables', 'rompevientos',
  ],
  arriba: [
    'camisas', 'blusas', 'playeras', 'playeras-manga-larga', 'polos', 'tops', 'crop-tops', 'camisetas-sin-mangas',
    'bodies', 'tops-deportivos', 'sueteres', 'cuello-tortuga', 'cardigans', 'sudaderas', 'sudaderas-capucha',
    'chalecos', 'corsets', 'jerseys-futbol',
  ],
  completo: ['vestidos', 'jumpsuits', 'overoles', 'trajes', 'conjuntos-deportivos', 'pijamas', 'trajes-bano'],
  abajo: [
    'pantalones', 'pantalones-cargo', 'pantalones-vestir', 'pantalones-acampanados', 'pantalones-deportivos',
    'palazzos', 'joggers', 'leggings', 'jeans', 'shorts', 'shorts-ciclismo', 'bermudas', 'faldas', 'faldas-short',
  ],
  zapatos: [
    'tenis', 'tacos-futbol', 'zapatos', 'mocasines', 'tacones', 'flats', 'plataformas', 'alpargatas', 'botas',
    'botines', 'botas-vaqueras', 'botas-lluvia', 'sandalias', 'chanclas', 'pantuflas',
  ],
  accesorio: [
    'cinturones', 'bufandas', 'panuelos', 'guantes', 'corbatas', 'bolsas', 'mochilas', 'lentes-sol', 'lentes',
    'relojes', 'collares', 'pulseras', 'aretes', 'anillos', 'carteras', 'rinoneras', 'tirantes',
  ],
}

// En que lugar del outfit va una prenda; undefined si no entra en ninguno (calcetines, medias)
export function slotOf(type: ClothingType): OutfitSlot | undefined {
  return (Object.keys(slotTypes) as OutfitSlot[]).find((slot) => slotTypes[slot].includes(type))
}

// Un outfit armado: la prenda de cada lugar
export type OutfitPieces = Partial<Record<OutfitSlot, ClosetItem>>

// Las prendas del outfit acomodadas por lugar
export function piecesOf(items: ClosetItem[]): OutfitPieces {
  const pieces: OutfitPieces = {}
  for (const item of items) {
    const slot = slotOf(item.type)
    if (slot && !pieces[slot]) pieces[slot] = item
  }
  return pieces
}

// Identifica una combinacion sin importar el orden, para no repetirla
export function comboKey(pieces: OutfitPieces) {
  return Object.values(pieces)
    .map((item) => item!.id)
    .sort()
    .join('|')
}

function pick<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)]
}

type GenerateOptions = {
  items: ClosetItem[]
  seasons: Season[]
  optional: OptionalSlot[]
  locked: OutfitPieces
  // Combinaciones que ya salieron o ya estan guardadas
  seen: Set<string>
}

// Arma un outfit al azar: una prenda por lugar, respeta las bloqueadas y la temporada, y
// busca una combinacion nueva. repeated = true si ya no quedaba ninguna sin repetir
export function generateOutfit({ items, seasons, optional, locked, seen }: GenerateOptions) {
  // Una prenda sin temporada sirve para todas
  const fits = (item: ClosetItem) =>
    seasons.length === 0 || item.seasons.length === 0 || item.seasons.some((s) => seasons.includes(s))
  const pool = (slot: OutfitSlot) => items.filter((item) => slotOf(item.type) === slot && fits(item))

  function once(): OutfitPieces {
    const pieces: OutfitPieces = {}
    // Vestido o arriba + abajo: si hay algo bloqueado manda eso; si no, al azar segun cuantas prendas hay
    const tops = pool('arriba').length
    const fulls = pool('completo').length
    const useFull = locked.completo
      ? true
      : locked.arriba || locked.abajo
        ? false
        : fulls > 0 && Math.random() < fulls / (fulls + Math.max(tops, 1))
    const slots: OutfitSlot[] = [...(useFull ? ['completo' as const] : ['arriba' as const, 'abajo' as const]), 'zapatos', ...optional]
    for (const slot of slots) {
      const item = locked[slot] ?? pick(pool(slot))
      if (item) pieces[slot] = item
    }
    return pieces
  }

  // Varios intentos para encontrar una combinacion que no haya salido
  let pieces = once()
  for (let attempt = 0; attempt < 40 && seen.has(comboKey(pieces)); attempt++) pieces = once()
  return { pieces, repeated: seen.has(comboKey(pieces)) }
}

// Lugares que faltan porque no hay prendas de ese tipo (para avisar que agregue)
export function missingSlots(items: ClosetItem[], optional: OptionalSlot[]) {
  const has = (slot: OutfitSlot) => items.some((item) => slotOf(item.type) === slot)
  const missing: OutfitSlot[] = []
  if (!has('completo') && !has('arriba')) missing.push('arriba')
  if (!has('completo') && !has('abajo')) missing.push('abajo')
  for (const slot of ['zapatos', ...optional] as OutfitSlot[]) if (!has(slot)) missing.push(slot)
  return missing
}

// Un outfit guardado
export type Outfit = {
  id: string
  ownerId: string
  owner: FeedUser
  name: string
  // Con true cualquiera lo ve con su link; se activa al mostrarlo en el closet o publicarlo
  isPublic: boolean
  inCloset: boolean
  items: ClosetItem[]
  createdAt: Date
}
