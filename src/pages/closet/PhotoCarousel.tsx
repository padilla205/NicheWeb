import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useState } from 'react'
import { usePinchZoom } from '@/hooks/usePinchZoom'
import { cn } from '@/lib/utils'

type PhotoCarouselProps = {
  itemId: string
  photos: string[]
  index: number
  onIndexChange: (index: number) => void
  alt: string
  className?: string
  animation?: 'slide' | 'cards'
  fit?: 'cover' | 'contain'
  topRightControl?: ReactNode
  // Pantalla completa: pellizcar, rueda del mouse o doble toque para acercar la foto
  zoomable?: boolean
  // Version chica de la portada (ya cargada en la cuadricula): se ve mientras llega la grande
  placeholder?: string
}

// Las flechas aparecen al pasar el mouse; en celular (sin mouse) siempre se ven
const controlVisibility =
  'pointer-events-none opacity-0 transition-opacity duration-150 group-hover/photos:pointer-events-auto group-hover/photos:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 has-[:focus-visible]:pointer-events-auto has-[:focus-visible]:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100'
const arrowClass = cn(
  controlVisibility,
  'touch-target absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50',
)

const slideVariants = {
  enter: (direction: number) => ({ x: `${direction * 100}%` }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: `${direction * -100}%` }),
}
// La foto superior sale como una carta y descubre la siguiente debajo.
const cardVariants = {
  enter: (direction: number) => ({ x: `${direction * 8}%`, scale: 0.92, rotate: direction * 3, opacity: 0, zIndex: 0 }),
  center: { x: '0%', scale: 1, rotate: 0, opacity: 1, zIndex: 1 },
  exit: (direction: number) => ({ x: `${direction * -110}%`, scale: 0.96, rotate: direction * -12, opacity: 0, zIndex: 2 }),
}
const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}
// Deslizamiento rapido (250 ms) que frena suave al final
const slideTransition = { type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] } as const
// Las cartas arrancan y frenan gradualmente para apreciar el recorrido completo.
const cardTransition = {
  type: 'tween',
  duration: 0.6,
  ease: [0.45, 0, 0.2, 1],
  zIndex: { duration: 0 },
} as const

// Distancia (px) o rapidez (px/s) minima del dedo para que cuente como deslizar a otra foto
const SWIPE_DISTANCE = 40
const SWIPE_VELOCITY = 300

export function PhotoCarousel({
  itemId,
  photos,
  index,
  onIndexChange,
  alt,
  className,
  animation = 'slide',
  fit = 'cover',
  topRightControl,
  zoomable = false,
  placeholder,
}: PhotoCarouselProps) {
  // La miniatura se quita en cuanto la portada grande termina de cargar
  const [coverLoaded, setCoverLoaded] = useState(false)
  const pinch = usePinchZoom()
  const reducedMotion = useReducedMotion()
  const hasMany = photos.length > 1
  // 1 = hacia adelante (la nueva entra por la derecha), -1 = hacia atras (entra por la izquierda)
  const [direction, setDirection] = useState(1)

  function go(step: 1 | -1) {
    const next = index + step
    if (next < 0 || next >= photos.length) return
    pinch.reset()
    setDirection(step)
    onIndexChange(next)
  }

  return (
    <div
      role="region"
      aria-label={`Fotos de ${alt}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (zoomable && ['+', '=', '-'].includes(event.key)) {
          return pinch.step(event.key === '-' ? 1 / 1.5 : 1.5, event.currentTarget)
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        go(event.key === 'ArrowLeft' ? -1 : 1)
      }}
      className={cn('group/photos relative outline-none focus-visible:ring-3 focus-visible:ring-ring/50', className)}
    >
      {/* Comparte "layoutId" entre tarjeta y detalle para que la foto crezca al abrir */}
      {/* Deslizar el dedo de lado cambia de foto; "pan-y" deja que el desplazamiento vertical de
          la pagina siga funcionando normal */}
      <motion.div
        layoutId={`item-photo-${itemId}`}
        layoutCrossfade={false}
        {...(zoomable ? pinch.handlers : {})}
        onPanEnd={(_, { offset, velocity }) => {
          // Si el gesto fue para acercar o moverse por la foto, no cambia de foto
          if (zoomable && pinch.wasZoomGesture()) return
          const horizontal = Math.abs(offset.x) > Math.abs(offset.y)
          if (horizontal && (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > SWIPE_VELOCITY)) {
            go(offset.x < 0 ? 1 : -1)
          }
        }}
        // Con zoom el navegador no mueve la pagina: todos los gestos son para la foto
        style={{ touchAction: zoomable ? 'none' : 'pan-y' }}
        className={cn('relative size-full overflow-hidden', zoomable && pinch.zoomed && 'cursor-grab active:cursor-grabbing')}
      >
        {/* Capa que se acerca y se mueve; la animacion de cambiar de foto va por dentro */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${pinch.zoom.x}px, ${pinch.zoom.y}px) scale(${pinch.zoom.scale})` }}
        >
        {/* Sin fondo gris propio: si la foto tarda un instante en dibujarse, se ve el color de la
            tarjeta y no un destello mas claro */}
        {/* Al cambiar de foto, la actual sale por un lado mientras la nueva entra por el otro */}
        {placeholder && !coverLoaded && (
          <img
            src={placeholder}
            alt=""
            aria-hidden
            draggable={false}
            className={cn('absolute inset-0 size-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
          />
        )}
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={index}
            src={photos[index]}
            alt={hasMany ? `${alt}, foto ${index + 1} de ${photos.length}` : alt}
            custom={direction}
            variants={reducedMotion ? reducedVariants : animation === 'cards' ? cardVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reducedMotion ? { duration: 0.15 } : animation === 'cards' ? cardTransition : slideTransition}
            // Pide al navegador tener la foto lista antes de pintar, para que no aparezca vacia al abrir
            decoding="sync"
            loading="lazy"
            onLoad={index === 0 ? () => setCoverLoaded(true) : undefined}
            draggable={false}
            style={{ transformOrigin: '50% 85%' }}
            className={cn('absolute inset-0 size-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
          />
        </AnimatePresence>
        </div>
      </motion.div>

      {/* Se oculta la flecha que no lleva a ningun lado (en la primera y en la ultima foto) */}
      {hasMany && index > 0 && (
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={() => go(-1)}
          className={cn(arrowClass, 'left-2', animation === 'cards' && 'size-10')}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      {hasMany && index < photos.length - 1 && (
        <button
          type="button"
          aria-label="Foto siguiente"
          onClick={() => go(1)}
          className={cn(arrowClass, 'right-2', animation === 'cards' && 'size-10')}
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {topRightControl && (
        <div className={cn(controlVisibility, 'absolute top-2 right-2 z-10')}>
          {topRightControl}
        </div>
      )}

      {/* Puntitos que indican en que foto vas */}
      {hasMany && (
        <div aria-hidden="true" className={cn(
          'pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5',
          animation === 'cards' && 'opacity-0 transition-opacity duration-150 group-hover/photos:opacity-100 group-focus-visible/photos:opacity-100 has-[:focus-visible]:opacity-100 [@media(hover:none)]:opacity-100',
        )}>
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
