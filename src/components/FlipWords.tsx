import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Palabra que cambia sola cada pocos segundos: la vieja sale volando y desenfocada y la nueva entra
// letra por letra (adaptado de Flip Words de Aceternity UI)
export function FlipWords({ words, duration = 2600, className }: { words: string[]; duration?: number; className?: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), duration)
    return () => window.clearInterval(timer)
  }, [words.length, duration])

  const word = words[index]
  return (
    <span className="relative inline-block">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={word}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, x: 40, filter: 'blur(8px)', scale: 2 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className={cn('inline-block whitespace-nowrap', className)}
        >
          {word.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
