import { Archive, Shirt, ShoppingBag, Shuffle, Users, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const SLIDES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Archive, title: 'Closet', text: 'Guarda todas tus prendas con foto' },
  { icon: Shuffle, title: 'Outfits', text: 'Arma outfits al azar con lo que ya tienes' },
  { icon: Users, title: 'Feed', text: 'Comparte tus looks y descubre otros' },
  { icon: ShoppingBag, title: 'Marketplace', text: 'Vende y compra prendas cerca de ti' },
]

const SLIDE_MS = 4000

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
      className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground md:h-full md:justify-between md:p-10"
    >
      <p className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Shirt className="size-7" aria-hidden="true" />
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
