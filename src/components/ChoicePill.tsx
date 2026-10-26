import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ChoicePillProps = {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  // En grupos donde solo una opcion puede estar elegida: el fondo se desliza de una opcion a otra.
  // Todas las pastillas del grupo llevan el mismo nombre
  slideId?: string
}

// Elegida: fondo del color del texto con letras del color del fondo (carbon en claro, casi blanca en oscuro)
const selectedClass =
  'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background'

// Opcion redonda que se marca y desmarca (temporadas, estado de una venta, etc.)
export function ChoicePill({ active, disabled, onClick, children, slideId }: ChoicePillProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={active}
      data-choice
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'touch-target relative rounded-full',
        // Seleccionado: fondo del color del texto (carbon en claro, casi blanco en oscuro)
        active && !slideId && selectedClass,
        // Con slideId el fondo lo dibuja la capa que se desliza; el boton solo cambia el color del texto
        active &&
          slideId &&
          'border-transparent bg-transparent text-background hover:bg-transparent hover:text-background dark:border-transparent dark:bg-transparent dark:hover:bg-transparent',
      )}
    >
      {active && slideId && (
        <motion.span
          layoutId={slideId}
          transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
          className={cn('absolute inset-0 rounded-full border', selectedClass)}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {active && <Check />}
        {children}
      </span>
    </Button>
  )
}
