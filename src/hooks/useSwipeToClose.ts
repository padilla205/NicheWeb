import { type PanInfo, useDragControls } from 'motion/react'
import type { PointerEvent } from 'react'

// Cuanto hay que jalar hacia abajo (px) o que tan rapido (px/s) para que la ventana se cierre
const CLOSE_DISTANCE = 100
const CLOSE_VELOCITY = 500

// Deslizar hacia abajo para cerrar una ventana. El arrastre solo empieza desde la agarradera
// (startDrag), asi el contenido de adentro se sigue desplazando normal con el dedo
export function useSwipeToClose(onClose: () => void) {
  const controls = useDragControls()

  return {
    startDrag: (event: PointerEvent) => controls.start(event),
    panelProps: {
      drag: 'y' as const,
      dragControls: controls,
      dragListener: false,
      // Hacia arriba no se mueve; hacia abajo sigue al dedo y, si no se cierra, regresa a su lugar
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: { top: 0, bottom: 0.8 },
      onDragEnd: (_: unknown, { offset, velocity }: PanInfo) => {
        if (offset.y > CLOSE_DISTANCE || velocity.y > CLOSE_VELOCITY) onClose()
      },
    },
  }
}
