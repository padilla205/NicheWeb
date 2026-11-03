import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Texto de ayuda de un buscador que va cambiando de ejemplo cada pocos segundos: el viejo sube y se
// va y el nuevo entra desde abajo. Solo se ve con el campo vacio (adaptado de Placeholders and
// Vanish Input de Aceternity UI)
// className: para moverlo si el icono de la lupa queda en otro lugar
export function CyclingPlaceholder({ texts, show, className }: { texts: string[]; show: boolean; className?: string }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % texts.length), 3000)
    return () => window.clearInterval(timer)
  }, [texts.length])
  if (!show) return null
  return (
    <span
      aria-hidden
      className={cn('pointer-events-none absolute inset-y-0 left-9 flex items-center overflow-hidden text-base text-muted-foreground md:text-sm', className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
