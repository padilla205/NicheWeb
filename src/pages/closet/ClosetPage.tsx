import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { PageTitle } from '@/components/PageTitle'
import type { ClothingType } from '@/lib/clothing'
import { useItems } from '@/hooks/useItems'
import { AddItemButton } from './AddItemButton'
import { AddItemDialog } from './AddItemDialog'
import { ClosetEmpty } from './ClosetEmpty'
import { ClosetFilters } from './ClosetFilters'
import { ClosetGrid } from './ClosetGrid'

export function ClosetPage() {
  const [selectedTypes, setSelectedTypes] = useState<ClothingType[]>([])
  // Boton desde el que se abrio "Agregar prenda" (arriba o en el closet vacio); null si esta cerrada
  const [addOrigin, setAddOrigin] = useState<{ from: 'top' | 'empty'; button: HTMLElement } | null>(
    null,
  )
  const closeAdd = useCallback(() => setAddOrigin(null), [])
  const items = useItems()
  const visibleItems =
    selectedTypes.length === 0 ? items : items.filter((item) => selectedTypes.includes(item.type))

  return (
    // Aperturas con un ligero rebote en unos 300 ms; si el sistema pide menos movimiento, se respeta
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Closet" description="Aqui veras todas tus prendas." />
        <div className="flex gap-2">
          <ClosetFilters selected={selectedTypes} onChange={setSelectedTypes} />
          <AddItemButton
            hidden={addOrigin?.from === 'top'}
            onOpen={(button) => setAddOrigin({ from: 'top', button })}
          />
        </div>
      </div>
      {items.length === 0 ? (
        <ClosetEmpty
          addOpen={addOrigin?.from === 'empty'}
          onAdd={(button) => setAddOrigin({ from: 'empty', button })}
        />
      ) : visibleItems.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Ninguna prenda coincide con los filtros.
        </p>
      ) : (
        <ClosetGrid items={visibleItems} />
      )}
      <AddItemDialog origin={addOrigin?.button ?? null} onClose={closeAdd} />
    </MotionConfig>
  )
}
