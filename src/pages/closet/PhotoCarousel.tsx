import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type PhotoCarouselProps = {
  itemId: string
  photos: string[]
  index: number
  onIndexChange: (index: number) => void
  alt: string
  className?: string
}

// Las flechas aparecen al pasar el mouse; en celular (sin mouse) siempre se ven
const arrowClass =
  'absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm transition-opacity duration-150 outline-none hover:bg-background focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 opacity-0 group-hover/photos:opacity-100 [@media(hover:none)]:opacity-100'

const slideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
}
// Deslizamiento rapido (250 ms) que frena suave al final
const slideTransition = { type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] } as const

export function PhotoCarousel({
  itemId,
  photos,
  index,
  onIndexChange,
  alt,
  className,
}: PhotoCarouselProps) {
  const hasMany = photos.length > 1
  // 1 = hacia adelante (la nueva entra por la derecha), -1 = hacia atras (entra por la izquierda)
  const [direction, setDirection] = useState(1)

  function go(step: 1 | -1) {
    setDirection(step)
    onIndexChange(index + step)
  }

  return (
    <div className={cn('group/photos relative', className)}>
      {/* Comparte "layoutId" entre tarjeta y detalle para que la foto crezca al abrir */}
      <motion.div
        layoutId={`item-photo-${itemId}`}
        layoutCrossfade={false}
        className="relative size-full overflow-hidden"
      >
        {/* Sin fondo gris propio: si la foto tarda un instante en dibujarse, se ve el color de la
            tarjeta y no un destello mas claro */}
        {/* Al cambiar de foto, la actual sale por un lado mientras la nueva entra por el otro */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={index}
            src={photos[index]}
            alt={hasMany ? `${alt}, foto ${index + 1} de ${photos.length}` : alt}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            // Pide al navegador tener la foto lista antes de pintar, para que no aparezca vacia al abrir
            decoding="sync"
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
      </motion.div>

      {/* Se oculta la flecha que no lleva a ningun lado (en la primera y en la ultima foto) */}
      {hasMany && index > 0 && (
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={() => go(-1)}
          className={cn(arrowClass, 'left-2')}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {hasMany && index < photos.length - 1 && (
        <button
          type="button"
          aria-label="Foto siguiente"
          onClick={() => go(1)}
          className={cn(arrowClass, 'right-2')}
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Puntitos que indican en que foto vas */}
      {hasMany && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
          {photos.map((photo, i) => (
            <span
              key={photo}
              className={cn(
                'size-1.5 rounded-full bg-white/60 shadow-sm transition-colors duration-150',
                i === index && 'bg-white',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
