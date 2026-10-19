import 'leaflet/dist/leaflet.css'
import { divIcon } from 'leaflet'
import { useEffect, useRef } from 'react'
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from '@/hooks/useCityCenter'
import type { Delivery } from '@/lib/marketplace'

type DeliveryMapProps = {
  // Donde se centra el mapa si aun no hay lugar elegido
  center: LatLng
  value?: Delivery
  // Sin onChange el mapa es solo para ver (pagina de la venta)
  onChange?: (value: Delivery) => void
  className?: string
}

// Punto azul con borde blanco; se dibuja con HTML para no depender de las imagenes de Leaflet
const pin = divIcon({
  className: '',
  html: '<span class="block size-5 rounded-full border-[3px] border-white bg-blue-600 shadow-md"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Mapa de OpenStreetMap con el punto de entrega y, si hay radio, el circulo de la zona
// ponytail: tiles publicos de openstreetmap.org, bien para pocos usuarios; con trafico real usar un proveedor de tiles
export default function DeliveryMap({ center, value, onChange, className }: DeliveryMapProps) {
  const position = value ?? center
  const zoom = value?.radiusKm ? zoomForRadius(value.radiusKm) : 14

  return (
    // isolate: los paneles del mapa no se dibujan encima de la barra superior de la app
    <div className={className} style={{ isolation: 'isolate' }}>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="size-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FollowCenter center={center} target={position} zoom={zoom} />
        {onChange && <PickOnClick value={value} onChange={onChange} />}
        {value && (
          <>
            {value.radiusKm && (
              <Circle
                center={[value.lat, value.lng]}
                radius={value.radiusKm * 1000}
                pathOptions={{ color: '#2563eb', fillOpacity: 0.15, weight: 2 }}
              />
            )}
            <Marker
              position={[value.lat, value.lng]}
              icon={pin}
              draggable={Boolean(onChange)}
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng()
                  onChange?.({ ...value, lat, lng })
                },
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}

// Tocar el mapa mueve el punto de entrega ahi
function PickOnClick({ value, onChange }: { value?: Delivery; onChange: (value: Delivery) => void }) {
  useMapEvents({
    click: (event) => onChange({ ...value, lat: event.latlng.lat, lng: event.latlng.lng }),
  })
  return null
}

// Recentra el mapa cuando cambia la ciudad o el radio (no al mover el punto, para que no salte).
// Tambien recalcula su tamano al abrir: dentro de una ventana que crece con animacion Leaflet lo mide mal
function FollowCenter({ center, target, zoom }: { center: LatLng; target: LatLng; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 350)
    return () => window.clearTimeout(timer)
  }, [map])
  // target se lee al momento, pero no dispara el efecto
  const targetRef = useRef(target)
  targetRef.current = target
  useEffect(() => {
    map.setView([targetRef.current.lat, targetRef.current.lng], zoom)
  }, [map, center.lat, center.lng, zoom])
  return null
}

// Zoom para que el circulo quepa en el mapa
function zoomForRadius(km: number) {
  return Math.max(8, Math.min(15, Math.round(14 - Math.log2(km))))
}
