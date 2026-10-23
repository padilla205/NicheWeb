import { Plus, Search } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { usePaged } from '@/hooks/usePaged'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCityCenter } from '@/hooks/useCityCenter'
import { useListings } from '@/hooks/useListings'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getCityLabel, isSameCity } from '@/lib/locations'
import {
  countActiveFilters,
  emptyFilters,
  type ListingSort,
  matchesListing,
  normalizeSize,
  sortListings,
} from '@/lib/marketplace'
import { CreateListingDialog } from './CreateListingDialog'
import { ListingCard } from './ListingCard'
import { LocationButton } from './LocationButton'
import { MarketplaceFilters } from './MarketplaceFilters'
import { SortSelect } from './SortSelect'

// Ventas por bloque antes de "Ver mas"
const MARKETPLACE_PAGE_SIZE = 12

export function MarketplacePage() {
  // Boton que abrio "Crear venta"; null si la ventana esta cerrada
  const [createOrigin, setCreateOrigin] = useState<HTMLElement | null>(null)
  const closeCreate = useCallback(() => setCreateOrigin(null), [])
  // Las vendidas ya no se ofrecen; las apartadas si se ven, con su etiqueta
  const listings = useListings().filter((listing) => listing.status !== 'vendida')
  const location = useUserLocation()
  // Con localizacion elegida se ven primero las ventas de tu ciudad; "Todas" quita el filtro
  const [showAll, setShowAll] = useState(false)
  const onlyMyCity = location !== null && !showAll
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const searching = query.trim() !== '' || countActiveFilters(filters) > 0
  const cityListings = onlyMyCity
    ? listings.filter((listing) => isSameCity(listing.location, location))
    : listings
  const [sort, setSort] = useState<ListingSort>('recientes')
  // Sin ciudad elegida no se puede ordenar por cercania; se vuelve a "recientes"
  const activeSort = sort === 'cercanos' && !location ? 'recientes' : sort
  // Solo se busca el centro de tu ciudad cuando ordenas por cercania
  const center = useCityCenter(activeSort === 'cercanos' ? location : null)
  const visibleListings = sortListings(
    cityListings.filter((listing) => matchesListing(listing, query, filters)),
    activeSort,
    location,
    center,
  )
  // Al cambiar busqueda, filtros, ciudad u orden se vuelve al primer bloque
  const page = usePaged(visibleListings, MARKETPLACE_PAGE_SIZE, JSON.stringify([query, filters, onlyMyCity, activeSort]))
  // Tallas que existen en las ventas, sin repetir, para el filtro
  const sizes = useMemo(
    () => [...new Set(listings.map((listing) => normalizeSize(listing.size)))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })),
    [listings],
  )

  function clearSearch() {
    setQuery('')
    setFilters(emptyFilters)
  }

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

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ventas: chamarra, nike, vintage..."
            aria-label="Buscar ventas"
            className="h-8 rounded-full pl-9"
          />
        </div>
        <MarketplaceFilters value={filters} onChange={setFilters} sizes={sizes} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {location && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Mostrar ventas">
            <ChoicePill active={onlyMyCity} onClick={() => setShowAll(false)}>
              En {getCityLabel(location)}
            </ChoicePill>
            <ChoicePill active={!onlyMyCity} onClick={() => setShowAll(true)}>
              Todas
            </ChoicePill>
          </div>
        )}
        <div className="ml-auto">
          <SortSelect value={activeSort} onChange={setSort} canSortByDistance={location !== null} />
        </div>
      </div>

      {visibleListings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground">
          {searching ? (
            <>
              <p>Ninguna venta coincide con tu busqueda.</p>
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Limpiar busqueda y filtros
              </Button>
            </>
          ) : onlyMyCity ? (
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
          {page.visible.map((listing) => (
            <li key={listing.id}>
              <ListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
      <ShowMore shown={page.visible.length} total={page.total} onClick={page.showMore} />
      <CreateListingDialog origin={createOrigin} onClose={closeCreate} />
    </MotionConfig>
  )
}
