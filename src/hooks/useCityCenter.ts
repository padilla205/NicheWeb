import { useEffect, useState } from 'react'
import { formatLocation, type UserLocation } from '@/lib/locations'

export type LatLng = { lat: number; lng: number }

// Centro de Mexico, por si no se puede ubicar la ciudad
export const FALLBACK_CENTER: LatLng = { lat: 19.4326, lng: -99.1332 }

// Las ciudades ya buscadas no se vuelven a pedir
const cache = new Map<string, LatLng>()

// Coordenadas de una ciudad con Nominatim, el buscador gratuito de OpenStreetMap (sin clave).
// Mientras carga, o si falla, devuelve null
export function useCityCenter(city: UserLocation | null) {
  const query = city ? formatLocation(city) : ''
  const [center, setCenter] = useState<LatLng | null>(() => cache.get(query) ?? null)

  useEffect(() => {
    if (!query) return setCenter(null)
    const cached = cache.get(query)
    if (cached) return setCenter(cached)

    const controller = new AbortController()
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<{ lat: string; lon: string }[]>)
      .then(([found]) => {
        if (!found) return
        const point = { lat: Number(found.lat), lng: Number(found.lon) }
        cache.set(query, point)
        setCenter(point)
      })
      // Sin internet o con el servicio caido, el mapa se queda en el centro de respaldo
      .catch(() => {})
    return () => controller.abort()
  }, [query])

  return center
}
