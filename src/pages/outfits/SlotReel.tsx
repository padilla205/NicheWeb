import { Shirt } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { ClosetItem } from '@/lib/clothing'

// Cuantas prendas pasan antes de la final, y cuanto mas gira cada carrete que el anterior
const BASE_FRAMES = 10
const EXTRA_FRAMES = 4
export const REEL_SECONDS = 0.9
export const REEL_STAGGER_SECONDS = 0.35

type SlotReelProps = {
  // La prenda en la que se detiene
  item: ClosetItem
  // Prendas de ese lugar que pueden pasar girando
  pool: ClosetItem[]
  // Lugar en la fila: los carretes se detienen uno tras otro, como en una tragaperras
  order: number
}

// Carrete de tragaperras: una tira vertical de prendas que baja rapido, frena y rebota en la final
export function SlotReel({ item, pool, order }: SlotReelProps) {
  const [frames] = useState(() => {
    const count = BASE_FRAMES + order * EXTRA_FRAMES
    const random = Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)] ?? item)
    return [...random, item]
  })
  const duration = REEL_SECONDS + order * REEL_STAGGER_SECONDS

  return (
    <motion.div
      aria-hidden
      initial={{ y: 0, filter: 'blur(3px)' }}
      animate={{ y: `-${((frames.length - 1) / frames.length) * 100}%`, filter: ['blur(3px)', 'blur(3px)', 'blur(0px)'] }}
      transition={{
        y: { type: 'spring', visualDuration: duration, bounce: 0.2 },
        filter: { duration, times: [0, 0.6, 1] },
      }}
      className="absolute inset-x-0 top-0"
      style={{ height: `${frames.length * 100}%` }}
    >
      {frames.map((frame, i) => (
        <div key={i} className="flex items-center justify-center bg-muted" style={{ height: `${100 / frames.length}%` }}>
          {frame.thumbUrl ? (
            <img src={frame.thumbUrl} alt="" className="size-full object-cover text-transparent" />
          ) : (
            <Shirt className="size-1/3 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
      ))}
    </motion.div>
  )
}
