import { motion } from 'motion/react'
import { type ClosetItem, getColorInfo, getTypeInfo } from '@/lib/clothing'
import { cn } from '@/lib/utils'

type ItemCardProps = {
  item: ClosetItem
  open: boolean
  // Mientras regresa a su lugar, la tarjeta va por encima de las demas
  raised: boolean
  onOpen: () => void
  onLayoutAnimationComplete: () => void
}

export function ItemCard({ item, open, raised, onOpen, onLayoutAnimationComplete }: ItemCardProps) {
  const typeLabel = getTypeInfo(item.type).label
  const title = item.name || typeLabel

  return (
    // Mientras la prenda esta abierta, su cuadro se queda escondido. Se hace en este contenedor
    // porque Motion controla la opacidad del cuadro y lo volvia a mostrar vacio al cambiar de foto
    <div className={cn('grid', open && 'pointer-events-none opacity-0')}>
      {/* El mismo "layoutId" en la tarjeta y en el detalle hace que la tarjeta crezca hasta abrirse */}
      <motion.button
        type="button"
        layoutId={`item-${item.id}`}
        onClick={onOpen}
        onLayoutAnimationComplete={onLayoutAnimationComplete}
        style={{ borderRadius: 12, zIndex: raised ? 60 : undefined }}
        className="relative flex flex-col overflow-hidden border bg-card text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* En la cuadricula siempre se ve la portada; las demas fotos se ven al abrir la prenda */}
        <motion.div layoutId={`item-photo-${item.id}`} className="aspect-square overflow-hidden bg-muted">
          <img src={item.photoUrls[0]} alt={title} loading="lazy" className="size-full object-cover" />
        </motion.div>
        {/* Al abrir, el texto se va casi al instante (80 ms); al cerrar regresa con suavidad */}
        <motion.div
          layout="position"
          animate={{
            opacity: open ? 0 : 1,
            transition: open ? { duration: 0.08 } : { duration: 0.2, delay: 0.15 },
          }}
          className="flex items-center justify-between gap-2 p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{title}</p>
            {item.name && <p className="truncate text-xs text-muted-foreground">{typeLabel}</p>}
          </div>
          <div className="flex shrink-0 -space-x-1.5">
            {item.colors.map((color) => (
              <span
                key={color}
                className="size-4 rounded-full border-2 border-card"
                style={{ backgroundColor: getColorInfo(color).hex }}
              />
            ))}
          </div>
        </motion.div>
      </motion.button>
    </div>
  )
}
