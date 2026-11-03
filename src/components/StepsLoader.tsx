import { CheckCircle2, Circle } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

// Lista de pasos de un proceso largo: los hechos con palomita, el actual resaltado y los que faltan
// tenues; la lista sube un renglon cada que avanza (adaptado de Multi Step Loader de Aceternity UI)
export function StepsLoader({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="relative h-24 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" aria-live="polite">
      <motion.ol animate={{ y: 36 - current * 28 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <motion.li
            key={i}
            animate={{ opacity: Math.max(1 - Math.abs(i - current) * 0.35, 0.15) }}
            className={cn('flex h-5 items-center gap-2 text-sm', i === current && 'font-medium')}
            aria-current={i === current ? 'step' : undefined}
          >
            {/* El ultimo paso (Listo) tambien lleva palomita cuando llega */}
            {i < current || (i === current && i === steps.length - 1) ? <CheckCircle2 className="size-4 shrink-0" /> : <Circle className={cn('size-4 shrink-0', i === current && 'animate-pulse')} />}
            {step}
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}
