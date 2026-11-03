import { Shuffle } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

const pieces = [
  { src: '/landing/chamarra-sin-fondo.webp', label: 'Chamarra' },
  { src: '/landing/jersey-sin-fondo.webp', label: 'Arriba' },
  { src: '/landing/levis-sin-fondo.webp', label: 'Abajo' },
]

// Muestra del generador: cada pocos segundos las tres prendas vuelven a caer en su lugar, una tras
// otra, como cuando tocas "Generar outfit"
export function OutfitDemo() {
  const reduceMotion = useReducedMotion()
  const [round, setRound] = useState(0)
  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => setRound((r) => r + 1), 3200)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  return (
    <div className="mx-auto flex w-72 flex-col gap-3 rounded-[2rem] bg-card p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)]">
      {pieces.map((piece, i) => (
        <div key={piece.label} className="relative h-36 overflow-hidden rounded-2xl bg-muted">
          <motion.img
            key={`${round}-${i}`}
            src={piece.src}
            alt=""
            initial={reduceMotion ? false : { y: -60, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.25 + i * 0.18 }}
            className="absolute inset-3 size-[calc(100%-1.5rem)] object-contain"
          />
          <span className="absolute bottom-2 left-3 text-xs text-muted-foreground">{piece.label}</span>
        </div>
      ))}
      <motion.div
        key={round}
        initial={reduceMotion ? false : { scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="flex h-11 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background"
      >
        <Shuffle className="size-4" />
        Generar outfit
      </motion.div>
    </div>
  )
}
