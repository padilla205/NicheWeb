import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  // "section" para bloques con titulo (asi los lectores de pantalla los reconocen como secciones)
  as?: 'div' | 'section'
}

// Lo que esta dentro aparece subiendo un poco cuando llega a la pantalla al bajar (una sola vez).
// Si el sistema pide menos movimiento, se ve directo
export function Reveal({ children, className, as = 'div' }: RevealProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  const Animated = as === 'section' ? motion.section : motion.div
  return (
    <Animated
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Empieza un poco antes de que el bloque entre completo, para que no se vea tarde
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className={className}
    >
      {children}
    </Animated>
  )
}
