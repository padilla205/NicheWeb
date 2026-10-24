import { LocateFixed } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { Button } from '@/components/ui/button'
import { FALLBACK_CENTER, useCityCenter } from '@/hooks/useCityCenter'
import type { UserLocation } from '@/lib/locations'
import type { Delivery } from '@/lib/marketplace'

// El mapa pesa bastante: solo se descarga cuando alguien lo abre
const DeliveryMap = lazy(() => import('@/components/DeliveryMap'))

const DEFAULT_RADIUS_KM = 5
const MAX_RADIUS_KM = 30

type Mode = 'none' | 'point' | 'radius'

type DeliveryPickerProps = {
  value?: Delivery
  onChange: (value: Delivery | undefined) => void
  // Ciudad elegida arriba en el formulario; el mapa empieza ahi
  city: UserLocation | null
}

// Elegir en el mapa un punto de encuentro o una zona (radio) de entrega
export function DeliveryPicker({ value, onChange, city }: DeliveryPickerProps) {
  const [mode, setMode] = useState<Mode>(value ? (value.radiusKm ? 'radius' : 'point') : 'none')
  const [locating, setLocating] = useState(false)
  const center = useCityCenter(city) ?? FALLBACK_CENTER
  // Si el usuario ya movio el punto a mano (o la venta ya tenia uno guardado), cambiar de ciudad ya no lo mueve
  const [touched, setTouched] = useState(value !== undefined)

  // Mientras no lo haya movido, el punto sigue a la ciudad (sus coordenadas pueden llegar un instante despues)
  useEffect(() => {
    if (value && !touched && (value.lat !== center.lat || value.lng !== center.lng)) {
      onChange({ ...value, lat: center.lat, lng: center.lng })
    }
    // Solo cuando cambia la ciudad
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng])

  function moveByHand(next: Delivery) {
    setTouched(true)
    onChange(next)
  }

  function changeMode(next: Mode) {
    setMode(next)
    if (next === 'none') return onChange(undefined)
    // Al cambiar de modo se conserva el punto; si aun no hay, empieza en el centro de la ciudad
    const point = value ?? center
    onChange({
      lat: point.lat,
      lng: point.lng,
      radiusKm: next === 'radius' ? (value?.radiusKm ?? DEFAULT_RADIUS_KM) : undefined,
    })
  }

  // Pone el punto donde esta el usuario (el navegador pide permiso)
  function locateMe() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        moveByHand({ lat: coords.latitude, lng: coords.longitude, radiusKm: value?.radiusKm })
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lugar de entrega">
        <ChoicePill slideId="delivery-mode" active={mode === 'none'} onClick={() => changeMode('none')}>
          Sin mapa
        </ChoicePill>
        <ChoicePill slideId="delivery-mode" active={mode === 'point'} onClick={() => changeMode('point')}>
          Punto de encuentro
        </ChoicePill>
        <ChoicePill slideId="delivery-mode" active={mode === 'radius'} onClick={() => changeMode('radius')}>
          Radio de entrega
        </ChoicePill>
      </div>

      {value && (
        <>
          <p className="text-xs text-muted-foreground">
            {mode === 'point'
              ? 'Toca el mapa o arrastra el punto. Elige un lugar publico, como una plaza o una estacion.'
              : 'Toca el mapa o arrastra el punto para mover el centro de la zona donde entregas.'}
          </p>

          <Suspense fallback={<div className="h-56 animate-pulse rounded-lg bg-muted" />}>
            <DeliveryMap center={center} value={value} onChange={moveByHand} className="h-56" />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {mode === 'radius' && value.radiusKm && (
              <label className="flex flex-1 items-center gap-3 text-sm">
                <span className="shrink-0 tabular-nums">{value.radiusKm} km</span>
                <input
                  type="range"
                  min={1}
                  max={MAX_RADIUS_KM}
                  value={value.radiusKm}
                  onChange={(event) => onChange({ ...value, radiusKm: Number(event.target.value) })}
                  aria-label="Radio de entrega en kilometros"
                  className="h-8 w-full min-w-32 accent-blue-600"
                />
              </label>
            )}
            {'geolocation' in navigator && (
              <Button type="button" variant="outline" size="sm" onClick={locateMe} disabled={locating}>
                <LocateFixed />
                {locating ? 'Buscando...' : 'Usar mi ubicacion'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
