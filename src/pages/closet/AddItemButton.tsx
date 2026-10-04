import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
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
    // Al cerrar reaparece justo cuando la ventana termina de encogerse sobre el, y hace un
    // rebote suave (se achica, se pasa un poquito y regresa) como si se acomodara en su lugar.
    // initial={false}: al cargar la pagina el boton aparece quieto, sin animar.
    // Escondido conserva su tamaño normal (scale 1) porque la ventana lo mide para saber a donde regresar
    <motion.span
      initial={false}
      animate={
        hidden
          ? { opacity: 0, scale: 1, transition: { duration: 0 } }
          : {
              opacity: 1,
              scale: [0.95, 1.03, 1],
              transition: {
                opacity: { delay: 0.2, duration: 0.1 },
                scale: { delay: 0.2, duration: 0.3, ease: 'easeOut', times: [0, 0.45, 1] },
              },
            }
      }
      className={cn('inline-flex', hidden && 'pointer-events-none')}
    >
      <Button onClick={(event) => onOpen(event.currentTarget)}>
        <Plus />
        Agregar prenda
      </Button>
    </motion.span>
  )
}
