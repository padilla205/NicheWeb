import type { LucideIcon } from 'lucide-react'
import { animate, AnimatePresence, motion } from 'motion/react'
import { type ComponentProps, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type CircleActionProps = ComponentProps<'button'> & {
  icon: LucideIcon
  label: string
  // Numero chico en la esquina (por ejemplo, filtros activos)
  badge?: number
  // Su menu esta abierto: el circulo se invierte (blanco con icono negro)
  active?: boolean
  // Abrio una ventana que sale de el: se esconde mientras esta abierta, porque la ventana "es" el boton
  hidden?: boolean
  // Grados que gira el icono mientras esta abierto (el + de Agregar gira como una x)
  iconTurn?: number
}

// Resorte del icono al girar y al cambiar (Publico / Privado)
const spring = { type: 'spring', visualDuration: 0.35, bounce: 0.3 } as const

// Accion rapida sobre fondo negro: circulo grafito con el icono y el nombre abajo, como los atajos
// de las apps de banco. Se usa en la cabecera negra del celular.
// Al tocarlo se hunde un poco; al cerrarse su menu o su ventana, el circulo la "recoge": aparece un
// poco chico, se infla de mas y se acomoda, y el icono regresa girando
export function CircleAction({
  icon: Icon,
  label,
  badge,
  active = false,
  hidden = false,
  iconTurn = 0,
  className,
  ...props
}: CircleActionProps) {
  const circle = useRef<HTMLSpanElement>(null)
  const engaged = active || hidden
  const before = useRef({ engaged, hidden })

  useEffect(() => {
    const was = before.current
    before.current = { engaged, hidden }
    if (!was.engaged || engaged || !circle.current) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Si salio una ventana, espera a que termine de encogerse sobre el (como MorphButton)
    animate(
      circle.current,
      { scale: [0.75, 1.12, 0.97, 1] },
      { duration: 0.42, ease: 'easeOut', times: [0, 0.45, 0.75, 1], delay: was.hidden ? 0.2 : 0 },
    )
  }, [engaged, hidden])

  return (
    <button
      type="button"
      className={cn(
        'group flex w-16 flex-col items-center gap-1.5 text-xs text-white/75 outline-none select-none',
        // Escondido al instante; al volver aparece cuando la ventana ya se encogio
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100 transition-opacity delay-200 duration-100',
        className,
      )}
      {...props}
    >
      <span
        ref={circle}
        className={cn(
          'relative flex size-14 items-center justify-center rounded-full ring-1 transition-[background-color,color,scale] duration-150 group-focus-visible:ring-2 group-focus-visible:ring-white/60 motion-safe:group-active:scale-90',
          active ? 'bg-white text-black ring-white' : 'bg-[#1C1C1C] text-white ring-white/10',
        )}
      >
        {/* Al cambiar de icono (Publico / Privado) el nuevo entra girando y el viejo se va */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: engaged ? iconTurn : 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={spring}
            className="flex"
          >
            <Icon className="size-5" />
          </motion.span>
        </AnimatePresence>
        {badge ? (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black tabular-nums ring-2 ring-black">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  )
}
