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
