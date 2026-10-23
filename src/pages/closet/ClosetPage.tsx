import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import type { ClothingType } from '@/lib/clothing'
import { useItems } from '@/hooks/useItems'
import { AddItemButton } from './AddItemButton'
import { AddItemDialog } from './AddItemDialog'
import { ClosetEmpty } from './ClosetEmpty'
import { ClosetFilters } from './ClosetFilters'
import { ClosetGrid } from './ClosetGrid'
import { ClosetSkeleton } from './ClosetSkeleton'
import { ClosetVisibility } from './ClosetVisibility'

export function ClosetPage() {
  const [selectedTypes, setSelectedTypes] = useState<ClothingType[]>([])
  // Boton desde el que se abrio "Agregar prenda" (arriba o en el closet vacio); null si esta cerrada
  const [addOrigin, setAddOrigin] = useState<{ from: 'top' | 'empty'; button: HTMLElement } | null>(
    null,
  )
  const closeAdd = useCallback(() => setAddOrigin(null), [])
  // Supabase filtra por tipo y manda de 20 en 20
  const { items, total, isPending, loadMore } = useItems(selectedTypes)
  // La pagina no sube al cambiar de filtro
  const keep = useKeepScroll(selectedTypes.join())

  return (
    // Aperturas con un ligero rebote en unos 300 ms; si el sistema pide menos movimiento, se respeta
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      {/* En pantallas angostas los botones bajan a su propia fila debajo del titulo */}
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <PageTitle title="Closet" />
        <div className="mb-6 flex gap-2">
          <ClosetVisibility />
          <ClosetFilters selected={selectedTypes} onChange={setSelectedTypes} />
          <AddItemButton
            hidden={addOrigin?.from === 'top'}
            onOpen={(button) => setAddOrigin({ from: 'top', button })}
          />
        </div>
      </div>
      <div ref={keep.ref} style={keep.style}>
        {isPending ? (
          <ClosetSkeleton />
        ) : items.length === 0 && selectedTypes.length === 0 ? (
          <ClosetEmpty
            addOpen={addOrigin?.from === 'empty'}
            onAdd={(button) => setAddOrigin({ from: 'empty', button })}
          />
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            Ninguna prenda coincide con los filtros.
          </p>
        ) : (
          <>
            <ClosetGrid items={items} />
            <ShowMore shown={items.length} total={total} onClick={loadMore} />
          </>
        )}
      </div>
      <AddItemDialog origin={addOrigin?.button ?? null} onClose={closeAdd} />
    </MotionConfig>
  )
}
