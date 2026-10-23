import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ChoicePillProps = {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

// Opcion redonda que se marca y desmarca (temporadas, estado de una venta, etc.)
export function ChoicePill({ active, disabled, onClick, children }: ChoicePillProps) {
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
        active &&
          'border-primary bg-primary/10 hover:bg-primary/15 dark:border-foreground dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 dark:hover:text-background',
      )}
    >
      {active && <Check />}
      {children}
    </Button>
  )
}
