import { Plus } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { useListings } from '@/hooks/useListings'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getCityLabel, isSameCity } from '@/lib/locations'
import { CreateListingDialog } from './CreateListingDialog'
import { ListingCard } from './ListingCard'
import { LocationButton } from './LocationButton'

export function MarketplacePage() {
  // Boton que abrio "Crear venta"; null si la ventana esta cerrada
  const [createOrigin, setCreateOrigin] = useState<HTMLElement | null>(null)
  const closeCreate = useCallback(() => setCreateOrigin(null), [])
  const listings = useListings()
  const location = useUserLocation()
  // Con localizacion elegida se ven primero las ventas de tu ciudad; "Todas" quita el filtro
  const [showAll, setShowAll] = useState(false)
  const onlyMyCity = location !== null && !showAll
  const visibleListings = onlyMyCity
    ? listings.filter((listing) => isSameCity(listing.location, location))
    : listings

  return (
    // Mismo resorte que el closet; si el sistema pide menos movimiento, se respeta
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <PageTitle title="Marketplace" />
        <div className="mb-6 flex gap-2">
          <LocationButton />
          <MorphButton hidden={createOrigin !== null} onOpen={setCreateOrigin}>
            <Plus />
            Crear venta
          </MorphButton>
        </div>
      </div>

      {location && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Mostrar ventas">
          <ChoicePill active={onlyMyCity} onClick={() => setShowAll(false)}>
            En {getCityLabel(location)}
          </ChoicePill>
          <ChoicePill active={!onlyMyCity} onClick={() => setShowAll(true)}>
            Todas
          </ChoicePill>
        </div>
      )}

      {visibleListings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground">
          {onlyMyCity ? (
            <>
              <p>Aun no hay ventas en {getCityLabel(location)}.</p>
              <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
                Ver todas las ventas
              </Button>
            </>
          ) : (
            <p>Aun no hay ventas publicadas.</p>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {visibleListings.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
      <CreateListingDialog origin={createOrigin} onClose={closeCreate} />
    </MotionConfig>
  )
}
