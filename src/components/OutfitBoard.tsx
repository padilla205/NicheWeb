import { Shirt } from 'lucide-react'
import type { ReactNode } from 'react'
import { getTypeInfo } from '@/lib/clothing'
import { type OutfitPieces, type OutfitSlot, slotLabels } from '@/lib/outfits'
import { cn } from '@/lib/utils'

// Lugar de cada prenda en el tablero, como un outfit acomodado sobre la mesa:
// la gorra arriba, la chamarra a la izquierda, lo de arriba/abajo/zapatos al centro y el accesorio a la derecha
const area: Record<OutfitSlot, string> = {
  cabeza: 'col-start-2 row-start-1 w-1/2 justify-self-center',
  chamarra: 'col-start-1 row-start-2 row-span-2 self-center',
  arriba: 'col-start-2 row-start-2',
  completo: 'col-start-2 row-start-2 row-span-2',
  abajo: 'col-start-2 row-start-3',
  zapatos: 'col-start-2 row-start-4 w-3/4 justify-self-center',
  accesorio: 'col-start-3 row-start-2 row-span-2 self-center',
}

type OutfitBoardProps = {
  pieces: OutfitPieces
  // Lugares que se dibujan aunque esten vacios (en el generador); sin esto, solo los que tienen prenda
  slots?: OutfitSlot[]
  // Algo encima de cada prenda, por ejemplo el candado del generador
  renderControl?: (slot: OutfitSlot) => ReactNode
  // Lo que se ve en un lugar sin prenda
  renderEmpty?: (slot: OutfitSlot) => ReactNode
  // En miniatura (tarjetas) no se ven los nombres
  compact?: boolean
  className?: string
}

export function OutfitBoard({ pieces, slots, renderControl, renderEmpty, compact, className }: OutfitBoardProps) {
  const shown = slots ?? (Object.keys(pieces) as OutfitSlot[])

  return (
    <div className={cn('grid grid-cols-[1fr_1.5fr_1fr] items-start', compact ? 'gap-1.5 p-2' : 'gap-3 p-4', className)}>
      {shown.map((slot) => {
        const item = pieces[slot]
        return (
          <div key={slot} className={cn('relative flex flex-col gap-1', area[slot])}>
            <div
              className={cn(
                'relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted',
                slot === 'completo' && 'aspect-[1/2]',
                !item && 'border border-dashed',
              )}
            >
              {item?.thumbUrl ? (
                <img src={item.thumbUrl} alt={item.name || getTypeInfo(item.type).label} loading="lazy" className="size-full object-cover text-transparent" />
              ) : item ? (
                <Shirt aria-hidden className="size-1/3 text-muted-foreground" strokeWidth={1.5} />
              ) : (
                renderEmpty?.(slot)
              )}
              {renderControl?.(slot)}
            </div>
            {!compact && (
              <p className="truncate text-center text-xs text-muted-foreground">
                {item ? item.name || getTypeInfo(item.type).label : slotLabels[slot]}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
