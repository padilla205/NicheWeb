import { AnimatePresence, motion } from 'motion/react'
import { popIn } from '@/lib/motion'
import { cn } from '@/lib/utils'

// Circulo rojo con los mensajes sin leer; con mas de 99 dice "99+". En 0 no se ve
export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <motion.span
          {...popIn}
          aria-hidden
          className={cn(
            'flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] leading-none font-semibold text-white tabular-nums',
            className,
          )}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
