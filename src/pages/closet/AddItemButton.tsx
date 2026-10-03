import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AddItemButtonProps = {
  // true mientras la ventana que abrio este boton esta abierta o cerrandose
  hidden: boolean
  onOpen: (button: HTMLElement) => void
}

export function AddItemButton({ hidden, onOpen }: AddItemButtonProps) {
  return (
    // Mientras la ventana esta abierta el boton se esconde, porque la ventana "sale" de el.
    // Al cerrar reaparece justo cuando la ventana termina de encogerse sobre el
    <span
      className={cn(
        'inline-flex',
        hidden
          ? 'pointer-events-none opacity-0'
          : 'opacity-100 transition-opacity delay-200 duration-100',
      )}
    >
      <Button onClick={(event) => onOpen(event.currentTarget)}>
        <Plus />
        Agregar prenda
      </Button>
    </span>
  )
}
