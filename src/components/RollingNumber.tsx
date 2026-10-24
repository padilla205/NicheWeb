import { AnimatePresence, motion } from 'motion/react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

// Formato con comas de miles (1,300), igual en todos los contadores
const format = new Intl.NumberFormat('en-US')

// Numero que cambia rodando como un contador mecanico: cada cifra que cambia sube (o baja, si el
// numero baja) y las que no cambian se quedan quietas. Las cifras se cuentan desde la derecha para
// que las unidades sean siempre la misma columna aunque el numero gane una cifra
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  const previous = useRef(value)
  const direction = value >= previous.current ? 1 : -1
  previous.current = value
  const chars = format.format(value).split('')

  return (
    <span aria-label={format.format(value)} className={cn('inline-flex overflow-hidden tabular-nums', className)}>
      {chars.map((char, index) => {
        const column = chars.length - index
        return (
          <span key={column} aria-hidden className="relative inline-flex justify-center">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.span
                key={char}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                  center: { y: '0%', opacity: 1 },
                  exit: (dir: number) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.2 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
    </span>
  )
}
