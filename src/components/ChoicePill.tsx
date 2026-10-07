import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ChoicePillProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
}

// Opcion redonda que se marca y desmarca (temporadas, estado de una venta, etc.)
export function ChoicePill({ active, onClick, children }: ChoicePillProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full',
        // Seleccionado: en modo claro borde marcado y fondo apenas iluminado; en modo oscuro
        // fondo blanco con letras negras. Las variantes dark: van completas porque las del
        // boton outline pesan mas
        active &&
          'border-primary bg-primary/10 hover:bg-primary/15 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90 dark:hover:text-black',
      )}
    >
      {active && <Check />}
      {children}
    </Button>
  )
}
