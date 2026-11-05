import { Search } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ShowMore } from '@/components/ShowMore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useProfile } from '@/hooks/useProfile'
import { countClosetFilters, emptyClosetFilters } from '@/lib/clothing'
import { loadItemDraft } from '@/lib/itemDraft'
import { crossfade } from '@/lib/motion'
import { mobileSheetClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { CyclingPlaceholder } from '@/components/CyclingPlaceholder'
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
import { ClosetHero } from './ClosetHero'
import { UserAvatar } from '@/pages/feed/UserAvatar'

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
  const profile = useProfile()
  // Busca el borrador al entrar y al cerrar la ventana (un momento despues, cuando ya se termino de guardar)
  const [hasDraft, setHasDraft] = useState(false)
  useEffect(() => {
    if (addOrigin) return
    const timer = window.setTimeout(() => {
      loadItemDraft(profile.id).then((draft) => setHasDraft(draft !== null))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [addOrigin, profile.id])

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
      {/* Celular: cabecera negra con saludo y atajos; las prendas van en una hoja que sube encima */}
      <ClosetHero
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={(button) => setAddOrigin({ from: 'top', button })}
        addOpen={addOrigin?.from === 'top'}
      />
      {/* Tableta y escritorio: titulo con sus botones */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 max-md:hidden">
        {/* Tu foto y tu nombre, como en la cabecera del celular */}
        <div className="mb-6 flex items-center gap-4">
          <UserAvatar user={profile} className="size-14 text-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">Hola, {profile.name.split(' ')[0]}</h1>
            <p className="text-sm text-muted-foreground">
              Tu closet
              {/* Solo en escritorio */}
              <span className="hidden lg:inline"> · Organiza tus prendas, crea outfits y preparate para vender.</span>
            </p>
          </div>
        </div>
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
      {/* Hoja de las prendas: en celular sube sobre la cabecera negra con las esquinas redondeadas */}
      <div className={mobileSheetClass}>
        {/* Si la pagina se reinicio o cerraste la ventana sin guardar, aqui se retoma */}
        {hasDraft && (
          // Con la ventana abierta sigue en su lugar, invisible: la ventana regresa a este boton al cerrar
          <div role="status" className={cn('mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-2.5 text-sm', addOrigin && 'invisible')}>
            <span className="text-pretty">Tienes una prenda sin guardar.</span>
            <Button size="sm" className="shrink-0 rounded-full" onClick={(event) => setAddOrigin({ from: 'shortcut', button: event.currentTarget })}>
              Continuar
            </Button>
          </div>
        )}
        {/* Con el closet vacio no hay nada que buscar */}
        {(isPending || items.length > 0 || filtering) && (
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar en tu closet"
              className="h-10 rounded-full pl-9 md:h-8"
            />
            {/* Ejemplos que van cambiando mientras el buscador esta vacio */}
            <CyclingPlaceholder show={!query} texts={['Buscar en tu closet', 'Prueba: chamarra', 'Prueba: tenis blancos', 'Prueba: jeans']} />
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
      </div>
      <AddItemDialog origin={addOrigin?.button ?? null} onClose={closeAdd} />
    </MotionConfig>
  )
}
