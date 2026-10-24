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

const selectedClass =
  'border-primary bg-primary/10 hover:bg-primary/15 dark:border-foreground dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 dark:hover:text-background'

// Opcion redonda que se marca y desmarca (temporadas, estado de una venta, etc.)
export function ChoicePill({ active, disabled, onClick, children, slideId }: ChoicePillProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'touch-target relative rounded-full',
        // Seleccionado: en modo claro borde marcado y fondo apenas iluminado; en modo oscuro
        // fondo del color del texto con letras del color del fondo (casi blanco y casi negro). Las variantes dark: van completas porque las del
        // boton outline pesan mas
        active && !slideId && selectedClass,
        // Con slideId el fondo lo dibuja la capa que se desliza; el boton solo cambia el color del texto
        active &&
          slideId &&
          'border-transparent bg-transparent hover:bg-transparent dark:border-transparent dark:bg-transparent dark:text-background dark:hover:bg-transparent dark:hover:text-background',
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
