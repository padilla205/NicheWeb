import { useQuery } from '@tanstack/react-query'
import type { LatLng } from '@/hooks/useCityCenter'

export type Weather = {
  // Grados centigrados, redondeados
  temperature: number
  sky: 'despejado' | 'nublado' | 'lluvia' | 'nieve'
}

// Codigos de clima de la Organizacion Meteorologica Mundial que usa Open-Meteo
function skyFromCode(code: number): Weather['sky'] {
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'nieve'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'lluvia'
  if (code >= 2) return 'nublado'
  return 'despejado'
}

// Clima actual de un punto con Open-Meteo (gratis y sin clave). Se vuelve a pedir cada 30 minutos
export function useWeather(center: LatLng | null) {
  return useQuery({
    queryKey: ['weather', center?.lat.toFixed(2), center?.lng.toFixed(2)],
    enabled: !!center,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Weather> => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${center!.lat}&longitude=${center!.lng}&current=temperature_2m,weather_code`
      const response = await fetch(url)
      if (!response.ok) throw new Error('No se pudo leer el clima')
      const data = (await response.json()) as { current: { temperature_2m: number; weather_code: number } }
      return { temperature: Math.round(data.current.temperature_2m), sky: skyFromCode(data.current.weather_code) }
    },
  })
}
