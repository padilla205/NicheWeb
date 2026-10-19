import type { PointerEvent } from 'react'
import { cn } from '@/lib/utils'

type SwipeHandleProps = {
  onPointerDown: (event: PointerEvent) => void
  // Color de la rayita: clara sobre fotos, gris sobre el fondo de la ventana
  barClassName?: string
}

// Agarradera de arriba de una ventana en el celular: de aqui se jala hacia abajo para cerrarla.
// Deja libres las esquinas para no tapar el boton de cerrar
export function SwipeHandle({ onPointerDown, barClassName = 'bg-white/80 shadow' }: SwipeHandleProps) {
  return (
    <div
      aria-hidden
      onPointerDown={onPointerDown}
      className="absolute inset-x-14 top-0 z-10 flex h-9 touch-none cursor-grab justify-center pt-2 md:hidden"
    >
      <span className={cn('h-1 w-10 rounded-full', barClassName)} />
    </div>
  )
}
