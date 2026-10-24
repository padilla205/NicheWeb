import { Cloud, CloudRain, type LucideIcon, Snowflake, Sparkles, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCityCenter } from '@/hooks/useCityCenter'
import { useUserLocation } from '@/hooks/useUserLocation'
import { useWeather, type Weather } from '@/hooks/useWeather'
import { getCityLabel } from '@/lib/locations'
import { weatherSuggestion } from '@/lib/outfits'
import { LocationButton } from '@/pages/marketplace/LocationButton'

const skyIcons: Record<Weather['sky'], LucideIcon> = {
  despejado: Sun,
  nublado: Cloud,
  lluvia: CloudRain,
  nieve: Snowflake,
}

type WeatherCardProps = {
  onSuggest: (suggestion: ReturnType<typeof weatherSuggestion>) => void
}

// Clima de tu ciudad y un boton para armar el outfit de hoy segun la temperatura
export function WeatherCard({ onSuggest }: WeatherCardProps) {
  const location = useUserLocation()
  const center = useCityCenter(location)
  const { data: weather, isError } = useWeather(center)

  // Sin ciudad elegida no hay clima: se pide la ciudad (la misma del marketplace)
  if (!location) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm">
        <Sun className="size-5 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-muted-foreground">Elige tu ciudad para armar outfits segun el clima.</p>
        <LocationButton />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
        No se pudo leer el clima de {getCityLabel(location)} en este momento.
      </p>
    )
  }

  if (!weather) return <div aria-hidden className="h-[58px] animate-pulse rounded-2xl bg-muted" />

  const suggestion = weatherSuggestion(weather)
  const SkyIcon = skyIcons[weather.sky]

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm">
      <SkyIcon className="size-6 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          <span className="tabular-nums">{weather.temperature}°</span> en {getCityLabel(location)}
        </p>
        <p className="text-muted-foreground">
          {suggestion.label}
          {weather.sky === 'lluvia' ? ' y llueve' : weather.sky === 'nieve' ? ' y nieva' : ''}
          {suggestion.jacket ? ': lleva chamarra' : ''}
        </p>
      </div>
      <Button onClick={() => onSuggest(suggestion)}>
        <Sparkles />
        Outfit para hoy
      </Button>
    </div>
  )
}
