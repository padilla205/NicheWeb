// Tipos de prenda agrupados por zona del cuerpo (filtros y, mas adelante, el formulario)
export const clothingZones = [
  {
    zone: 'cabeza',
    label: 'Cabeza',
    types: [
      { value: 'gorras', label: 'Gorras' },
      { value: 'gorros', label: 'Gorros' },
      { value: 'sombreros', label: 'Sombreros' },
    ],
  },
  {
    zone: 'cuerpo',
    label: 'Cuerpo',
    types: [
      { value: 'camisas', label: 'Camisas' },
      { value: 'blusas', label: 'Blusas' },
      { value: 'playeras', label: 'Playeras' },
      { value: 'polos', label: 'Polos' },
      { value: 'tops', label: 'Tops' },
      { value: 'sueteres', label: 'Sueteres' },
      { value: 'cardigans', label: 'Cardigans' },
      { value: 'sudaderas', label: 'Sudaderas' },
      { value: 'chalecos', label: 'Chalecos' },
      { value: 'chamarras', label: 'Chamarras' },
      { value: 'blazers', label: 'Blazers' },
      { value: 'abrigos', label: 'Abrigos' },
      { value: 'gabardinas', label: 'Gabardinas' },
      { value: 'vestidos', label: 'Vestidos' },
      { value: 'jerseys-futbol', label: 'Jersey de futbol' },
    ],
  },
  {
    zone: 'piernas',
    label: 'Piernas',
    types: [
      { value: 'pantalones', label: 'Pantalones' },
      { value: 'jeans', label: 'Jeans' },
      { value: 'shorts', label: 'Shorts' },
      { value: 'faldas', label: 'Faldas' },
    ],
  },
  {
    zone: 'pies',
    label: 'Pies',
    types: [
      { value: 'tenis', label: 'Tenis' },
      { value: 'zapatos', label: 'Zapatos' },
      { value: 'botas', label: 'Botas' },
      { value: 'sandalias', label: 'Sandalias' },
    ],
  },
] as const

export type ClothingZone = (typeof clothingZones)[number]['zone']
export type ClothingType = (typeof clothingZones)[number]['types'][number]['value']

// Temporadas en las que se usa una prenda (el generador de outfits filtrara por esto)
export const seasons = [
  { value: 'primavera', label: 'Primavera' },
  { value: 'verano', label: 'Verano' },
  { value: 'otono', label: 'Otono' },
  { value: 'invierno', label: 'Invierno' },
] as const

export type Season = (typeof seasons)[number]['value']

// Colores para elegir rapido; "light" indica si la palomita debe ser oscura para que se vea
export const clothingColors = [
  { value: 'negro', label: 'Negro', hex: '#111111', light: false },
  { value: 'blanco', label: 'Blanco', hex: '#ffffff', light: true },
  { value: 'gris', label: 'Gris', hex: '#9ca3af', light: true },
  { value: 'beige', label: 'Beige', hex: '#d9c7a7', light: true },
  { value: 'cafe', label: 'Cafe', hex: '#7b4a2a', light: false },
  { value: 'rojo', label: 'Rojo', hex: '#dc2626', light: false },
  { value: 'rosa', label: 'Rosa', hex: '#f472b6', light: true },
  { value: 'naranja', label: 'Naranja', hex: '#f97316', light: false },
  { value: 'amarillo', label: 'Amarillo', hex: '#facc15', light: true },
  { value: 'verde', label: 'Verde', hex: '#16a34a', light: false },
  { value: 'azul', label: 'Azul', hex: '#2563eb', light: false },
  { value: 'azul-marino', label: 'Azul marino', hex: '#1e3a5f', light: false },
  { value: 'morado', label: 'Morado', hex: '#7c3aed', light: false },
] as const

export type ClothingColor = (typeof clothingColors)[number]['value']

// Una prenda guardada en el closet
export type ClosetItem = {
  id: string
  // La primera foto es la portada
  photoUrls: string[]
  name: string
  type: ClothingType
  seasons: Season[]
  // Colores de la lista ("azul") o personalizados ("#1e90ff")
  colors: string[]
  // Solo en jerseys de futbol (valor de la lista de equipos)
  team?: string
  createdAt: Date
}

// Nombre del tipo de prenda y de su zona del cuerpo
export function getTypeInfo(type: ClothingType) {
  for (const zone of clothingZones) {
    const found = zone.types.find((t) => t.value === type)
    if (found) return { label: found.label, zoneLabel: zone.label }
  }
  return { label: type, zoneLabel: '' }
}

export function getSeasonLabel(season: Season) {
  return seasons.find((s) => s.value === season)?.label ?? season
}

// Nombre y codigo de color para pintar el circulo, tanto de la lista como personalizado
export function getColorInfo(color: string) {
  const preset = clothingColors.find((c) => c.value === color)
  return preset
    ? { label: preset.label, hex: preset.hex }
    : { label: 'Personalizado', hex: color }
}
