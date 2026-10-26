import { Search } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { countClosetFilters, emptyClosetFilters } from '@/lib/clothing'
import { crossfade } from '@/lib/motion'
import { useItems } from '@/hooks/useItems'
import { AddItemButton } from './AddItemButton'
import { AddItemDialog } from './AddItemDialog'
import { ClosetEmpty } from './ClosetEmpty'
import { ClosetFilters } from './ClosetFilters'
import { ClosetGrid } from './ClosetGrid'
import { ClosetSkeleton } from './ClosetSkeleton'
import { ClosetVisibility } from './ClosetVisibility'
import { ClosetEmptyDesktop } from './desktop/ClosetEmptyDesktop'
import { ClosetStats } from './desktop/ClosetStats'

export function ClosetPage() {
  const [filters, setFilters] = useState(emptyClosetFilters)
  // Lo que escribes en la busqueda; se aplica cuando dejas de escribir un momento, no con cada letra
  const [query, setQuery] = useState('')
  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => ({ ...current, query: query.trim() })), 300)
    return () => window.clearTimeout(timer)
  }, [query])
  const filtering = filters.query !== '' || countClosetFilters(filters) > 0
  // Boton desde el que se abrio "Agregar prenda" (arriba o en el closet vacio); null si esta cerrada
  const [addOrigin, setAddOrigin] = useState<{ from: 'top' | 'empty' | 'shortcut'; button: HTMLElement } | null>(
    null,
  )
  const closeAdd = useCallback(() => setAddOrigin(null), [])
  // Supabase busca, filtra y manda de 20 en 20
  const { items, total, isPending, loadMore } = useItems(filters)
  // La pagina no sube al cambiar de filtro
  const keep = useKeepScroll(JSON.stringify(filters))
  // Rediseno de escritorio (1024 px o mas): en pantallas menores ni siquiera se monta, asi el
  // celular queda igual que antes y no pide datos que no muestra
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // El atajo "Agregar prenda" del menu lateral trae a esta pagina con la orden de abrir la ventana,
  // que crece desde el propio atajo. Despues se borra la orden para que no se repita al recargar
  const location = useLocation()
  const navigate = useNavigate()
  const openFromShortcut = (location.state as { addItem?: boolean } | null)?.addItem
  useEffect(() => {
    if (!openFromShortcut) return
    const shortcut = document.querySelector<HTMLElement>('[data-shortcut="agregar-prenda"]')
    if (shortcut) setAddOrigin({ from: 'shortcut', button: shortcut })
    navigate('.', { replace: true, state: null })
  }, [openFromShortcut, navigate])

  return (
    // Aperturas con un ligero rebote en unos 300 ms; si el sistema pide menos movimiento, se respeta
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      {/* En pantallas angostas los botones bajan a su propia fila debajo del titulo */}
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <div>
          <PageTitle title="Closet" />
          {/* Solo en escritorio */}
          <p className="-mt-4 mb-6 hidden text-sm text-muted-foreground lg:block">
            Organiza tus prendas, crea outfits y preparate para vender.
          </p>
        </div>
        {/* En pantallas muy angostas los botones bajan de fila en vez de salirse */}
        <div className="mb-6 flex flex-wrap gap-2">
          <ClosetVisibility />
          <ClosetFilters value={filters} onChange={setFilters} />
          <AddItemButton
            hidden={addOrigin?.from === 'top'}
            onOpen={(button) => setAddOrigin({ from: 'top', button })}
          />
        </div>
      </div>
      {isDesktop && <ClosetStats />}
      {/* Con el closet vacio no hay nada que buscar */}
      {(isPending || items.length > 0 || filtering) && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar en tu closet"
            aria-label="Buscar en tu closet"
            className="h-8 rounded-full pl-9"
          />
        </div>
      )}
      <div ref={keep.ref} style={keep.style}>
        {/* El skeleton se desvanece hacia el contenido en vez de cambiar de golpe */}
        <AnimatePresence mode="wait" initial={false}>
          {isPending ? (
            <motion.div key="cargando" {...crossfade}>
              <ClosetSkeleton />
            </motion.div>
          ) : items.length === 0 && !filtering ? (
            <motion.div key="vacio" {...crossfade}>
              {/* Celular y tableta: el closet vacio de siempre. Escritorio: dos columnas con los primeros pasos */}
              {isDesktop ? (
                <ClosetEmptyDesktop
                  addOpen={addOrigin?.from === 'empty'}
                  onAdd={(button) => setAddOrigin({ from: 'empty', button })}
                />
              ) : (
                <ClosetEmpty
                  addOpen={addOrigin?.from === 'empty'}
                  onAdd={(button) => setAddOrigin({ from: 'empty', button })}
                />
              )}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="sin-resultados"
              {...crossfade}
              className="flex flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground"
            >
              <p>Ninguna prenda coincide con tu busqueda.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setFilters(emptyClosetFilters)
                }}
              >
                Limpiar busqueda y filtros
              </Button>
            </motion.div>
          ) : (
            <motion.div key="prendas" {...crossfade}>
              <ClosetGrid items={items} />
              <ShowMore shown={items.length} total={total} onClick={loadMore} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AddItemDialog origin={addOrigin?.button ?? null} onClose={closeAdd} />
    </MotionConfig>
  )
}
