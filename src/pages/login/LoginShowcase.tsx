import {
  Archive,
  Footprints,
  Gem,
  Glasses,
  Heart,
  Shirt,
  ShoppingBag,
  Shuffle,
  Sparkles,
  Tag,
  Users,
  Watch,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'
import { cn } from '@/lib/utils'

const SLIDES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Archive, title: 'Closet', text: 'Guarda todas tus prendas con foto' },
  { icon: Shuffle, title: 'Outfits', text: 'Arma outfits al azar con lo que ya tienes' },
  { icon: Users, title: 'Feed', text: 'Comparte tus looks y descubre otros' },
  { icon: ShoppingBag, title: 'Marketplace', text: 'Vende y compra prendas cerca de ti' },
]

const SLIDE_MS = 4000

// Objetos que flotan de fondo: posicion en %, tamano en px y cuanto tarda cada vaiven
const FLOATERS: { icon: LucideIcon; top: number; left: number; size: number; duration: number }[] = [
  { icon: Shirt, top: 14, left: 72, size: 40, duration: 7 },
  { icon: Footprints, top: 30, left: 88, size: 28, duration: 9 },
  { icon: Glasses, top: 62, left: 80, size: 36, duration: 8 },
  { icon: Watch, top: 82, left: 58, size: 26, duration: 10 },
  { icon: Gem, top: 22, left: 44, size: 22, duration: 6 },
  { icon: Tag, top: 74, left: 30, size: 30, duration: 11 },
  { icon: Heart, top: 48, left: 64, size: 20, duration: 7.5 },
  { icon: Sparkles, top: 8, left: 90, size: 24, duration: 8.5 },
]

// Capa de fondo con prendas y accesorios subiendo, bajando y girando lento
function FloatingObjects() {
  const reduceMotion = useReducedMotion()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {FLOATERS.map(({ icon: Icon, top, left, size, duration }, i) => (
        <motion.div
          key={i}
          className="absolute opacity-15"
          style={{ top: `${top}%`, left: `${left}%` }}
          animate={reduceMotion ? undefined : { y: [0, -18, 0], x: [0, 8, 0], rotate: [-12, 12, -12] }}
          // Cada uno empieza en otro momento para que no se muevan todos al mismo tiempo
          transition={{ duration, delay: -i * 1.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}
    </div>
  )
}

// Tarjeta que explica que es Niche: el logo arriba y las secciones pasando solas
export function LoginShowcase() {
  const [index, setIndex] = useState(0)

  // Al tocar un puntito el temporizador vuelve a empezar, para que no cambie enseguida
  useEffect(() => {
    const timer = setTimeout(() => setIndex((index + 1) % SLIDES.length), SLIDE_MS)
    return () => clearTimeout(timer)
  }, [index])

  const { icon: Icon, title, text } = SLIDES[index]

  return (
    <section
      aria-label="Que es Niche"
      className="relative isolate flex flex-col gap-6 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground md:h-full md:justify-between md:p-10"
    >
      <FloatingObjects />
      <p className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
        <BrandMark className="size-10" />
        Niche
      </p>

      {/* Cada diapositiva entra por la derecha y sale por la izquierda */}
      <div aria-live="polite" className="relative h-28 md:h-48">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={title}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}
            className="absolute inset-0 flex flex-col justify-center gap-3"
          >
            <Icon className="size-8 md:size-12" aria-hidden="true" />
            <h2 className="text-xl font-semibold md:text-3xl">{title}</h2>
            <p className="text-sm opacity-80 md:text-lg">{text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-1">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver ${slide.title}`}
            aria-current={i === index}
            className="flex h-6 items-center rounded-full px-1 outline-none focus-visible:ring-3 focus-visible:ring-primary-foreground/50"
          >
            <span
              className={cn(
                'h-1.5 rounded-full bg-current transition-[width,opacity] duration-200',
                i === index ? 'w-6' : 'w-1.5 opacity-40',
              )}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
