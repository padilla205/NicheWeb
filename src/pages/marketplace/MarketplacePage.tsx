import { Heart, Plus, Search } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCityCenter } from '@/hooks/useCityCenter'
import { useSavedListings } from '@/hooks/useFavorites'
import { useListingBrands, useListingSizes, useListings } from '@/hooks/useListings'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getCityLabel } from '@/lib/locations'
import { countActiveFilters, emptyFilters, type ListingSort } from '@/lib/marketplace'
import { cascade, crossfade } from '@/lib/motion'
import { CreateListingDialog } from './CreateListingDialog'
import { ListingCard } from './ListingCard'
import { ListingsSkeleton } from './ListingsSkeleton'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import { LocationButton } from './LocationButton'
import { MarketplaceFilters } from './MarketplaceFilters'
import { SortSelect } from './SortSelect'

export function MarketplacePage() {
  // Boton que abrio "Crear venta"; null si la ventana esta cerrada
  const [createOrigin, setCreateOrigin] = useState<HTMLElement | null>(null)
  const closeCreate = useCallback(() => setCreateOrigin(null), [])
  const location = useUserLocation()
  // Con localizacion elegida se ven primero las ventas de tu ciudad; "Todas" quita el filtro
  const [showAll, setShowAll] = useState(false)
  const onlyMyCity = location !== null && !showAll
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const searching = query.trim() !== '' || countActiveFilters(filters) > 0
  // Busca cuando dejas de escribir un momento, no con cada letra
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [query])
  const [sort, setSort] = useState<ListingSort>('recientes')
  // Sin ciudad elegida no se puede ordenar por cercania; se vuelve a "recientes"
  const activeSort = sort === 'cercanos' && !location ? 'recientes' : sort
  // Solo se busca el centro de tu ciudad cuando ordenas por cercania
  const center = useCityCenter(activeSort === 'cercanos' ? location : null)
  // Supabase busca, filtra y ordena; al cambiar algo se vuelve al primer bloque
  const { listings, total, isPending, loadMore } = useListings({
    query: debouncedQuery,
    filters,
    onlyCity: onlyMyCity ? location : null,
    sort: activeSort,
    near: location,
    center: activeSort === 'cercanos' ? center : null,
  })
  const sizes = useListingSizes()
  const brands = useListingBrands()
  // "Guardados": en vez de los resultados se ven las ventas que guardaste con el corazon
  const [showSaved, setShowSaved] = useState(false)
  const saved = useSavedListings(showSaved)
  // La pagina no sube al cambiar la busqueda, los filtros o el orden
  const keep = useKeepScroll(JSON.stringify([debouncedQuery, filters, activeSort, onlyMyCity, showSaved]))

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
            onChange={(event) => {
              setQuery(event.target.value)
              // Buscar te regresa a todas las ventas
              setShowSaved(false)
            }}
            placeholder="Buscar ventas"
            aria-label="Buscar ventas"
            className="h-8 rounded-full pl-9"
          />
        </div>
        <MarketplaceFilters value={filters} onChange={setFilters} sizes={sizes} brands={brands} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <ChoicePill active={showSaved} onClick={() => setShowSaved(!showSaved)}>
          {!showSaved && <Heart />}
          Guardados
        </ChoicePill>
        {location && !showSaved && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Mostrar ventas">
            <ChoicePill slideId="market-city" active={onlyMyCity} onClick={() => setShowAll(false)}>
              En {getCityLabel(location)}
            </ChoicePill>
            <ChoicePill slideId="market-city" active={!onlyMyCity} onClick={() => setShowAll(true)}>
              Todas
            </ChoicePill>
          </div>
        )}
        <div className={showSaved ? 'hidden' : 'ml-auto'}>
          <SortSelect value={activeSort} onChange={setSort} canSortByDistance={location !== null} />
        </div>
      </div>

      <div ref={keep.ref} style={keep.style}>
        {/* El skeleton se desvanece hacia el contenido en vez de cambiar de golpe */}
        <AnimatePresence mode="wait" initial={false}>
          {showSaved ? (
            saved.isPending ? (
              <motion.div key="guardados-cargando" {...crossfade}>
                <ListingsSkeleton />
              </motion.div>
            ) : saved.data?.length === 0 ? (
              <motion.p key="guardados-vacio" {...crossfade} className="py-20 text-center text-sm text-muted-foreground">
                Aun no guardas ventas. Toca el corazon de una venta para guardarla aqui.
              </motion.p>
            ) : (
              <motion.ul key="guardados" {...crossfade} className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {saved.data?.map((listing, index) => (
                  <motion.li key={listing.id} {...cascade(index)}>
                    <ListingCard listing={listing} />
                  </motion.li>
                ))}
              </motion.ul>
            )
          ) : isPending ? (
            <motion.div key="cargando" {...crossfade}>
              <ListingsSkeleton />
            </motion.div>
          ) : listings.length === 0 ? (
            <motion.div key="vacio" {...crossfade} className="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground">
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
            </motion.div>
          ) : (
            <motion.ul key="ventas" {...crossfade} className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing, index) => (
                // Aparecen en cascada al cargar o al pedir mas
                <motion.li key={listing.id} {...cascade(index)}>
                  <ListingCard listing={listing} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        {!showSaved && <ShowMore shown={listings.length} total={total} onClick={loadMore} />}
      </div>
      <CreateListingDialog origin={createOrigin} onClose={closeCreate} />
    </MotionConfig>
  )
}
