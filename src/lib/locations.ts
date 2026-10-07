// Paises y ciudades que se pueden elegir. Lista corta para el MVP; se puede ampliar sin tocar las pantallas
export const countries = [
  {
    value: 'mx',
    label: 'Mexico',
    cities: [
      { value: 'cdmx', label: 'Ciudad de Mexico' },
      { value: 'guadalajara', label: 'Guadalajara' },
      { value: 'monterrey', label: 'Monterrey' },
      { value: 'puebla', label: 'Puebla' },
      { value: 'queretaro', label: 'Queretaro' },
      { value: 'leon', label: 'Leon' },
      { value: 'tijuana', label: 'Tijuana' },
      { value: 'merida', label: 'Merida' },
      { value: 'cancun', label: 'Cancun' },
      { value: 'toluca', label: 'Toluca' },
      { value: 'aguascalientes', label: 'Aguascalientes' },
      { value: 'san-luis-potosi', label: 'San Luis Potosi' },
      { value: 'chihuahua', label: 'Chihuahua' },
      { value: 'hermosillo', label: 'Hermosillo' },
      { value: 'morelia', label: 'Morelia' },
      { value: 'veracruz', label: 'Veracruz' },
      { value: 'oaxaca', label: 'Oaxaca' },
      { value: 'culiacan', label: 'Culiacan' },
      { value: 'saltillo', label: 'Saltillo' },
      { value: 'torreon', label: 'Torreon' },
    ],
  },
  {
    value: 'co',
    label: 'Colombia',
    cities: [
      { value: 'bogota', label: 'Bogota' },
      { value: 'medellin', label: 'Medellin' },
      { value: 'cali', label: 'Cali' },
      { value: 'barranquilla', label: 'Barranquilla' },
      { value: 'cartagena', label: 'Cartagena' },
    ],
  },
  {
    value: 'ar',
    label: 'Argentina',
    cities: [
      { value: 'buenos-aires', label: 'Buenos Aires' },
      { value: 'cordoba', label: 'Cordoba' },
      { value: 'rosario', label: 'Rosario' },
      { value: 'mendoza', label: 'Mendoza' },
    ],
  },
  {
    value: 'cl',
    label: 'Chile',
    cities: [
      { value: 'santiago', label: 'Santiago' },
      { value: 'valparaiso', label: 'Valparaiso' },
      { value: 'concepcion', label: 'Concepcion' },
    ],
  },
  {
    value: 'pe',
    label: 'Peru',
    cities: [
      { value: 'lima', label: 'Lima' },
      { value: 'arequipa', label: 'Arequipa' },
      { value: 'cusco', label: 'Cusco' },
    ],
  },
  {
    value: 'es',
    label: 'Espana',
    cities: [
      { value: 'madrid', label: 'Madrid' },
      { value: 'barcelona', label: 'Barcelona' },
      { value: 'valencia', label: 'Valencia' },
      { value: 'sevilla', label: 'Sevilla' },
    ],
  },
  {
    value: 'us',
    label: 'Estados Unidos',
    cities: [
      { value: 'los-angeles', label: 'Los Angeles' },
      { value: 'houston', label: 'Houston' },
      { value: 'chicago', label: 'Chicago' },
      { value: 'nueva-york', label: 'Nueva York' },
      { value: 'miami', label: 'Miami' },
    ],
  },
] as const

// Pais y ciudad guardados como sus valores ("mx", "guadalajara")
export type UserLocation = {
  country: string
  city: string
}

export function getCountry(country: string) {
  return countries.find((c) => c.value === country)
}

// "Guadalajara, Mexico"
export function formatLocation({ country, city }: UserLocation) {
  const found = getCountry(country)
  const cityLabel = found?.cities.find((c) => c.value === city)?.label ?? city
  return `${cityLabel}, ${found?.label ?? country}`
}

// Solo el nombre de la ciudad, para textos cortos
export function getCityLabel({ country, city }: UserLocation) {
  return getCountry(country)?.cities.find((c) => c.value === city)?.label ?? city
}

export function isSameCity(a: UserLocation, b: UserLocation) {
  return a.country === b.country && a.city === b.city
}

// Devuelve la ubicacion solo cuando pais y ciudad estan completos
export function toLocation(country: string, city: string): UserLocation | null {
  return country && city ? { country, city } : null
}
