import { X } from 'lucide-react'
import { AnimatePresence, motion, useAnimate, usePresence, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { cn } from '@/lib/utils'

type MorphDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
  title: string
  description: string
  children: ReactNode
  // En celular, deslizar la ventana hacia arriba o hacia abajo (desde su titulo) la cierra
  swipeUpToClose?: boolean
}

// Ventana que nace del boton que la abrio (ver MorphButton) y al cerrarse regresa a el
export function MorphDialog({ origin, ...props }: MorphDialogProps) {
  return (
    <AnimatePresence>{origin !== null && <MorphPanel origin={origin} {...props} />}</AnimatePresence>
  )
}

// Mismo rebote que la apertura de las tarjetas (unos 300 ms)
const openSpring = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const
const PANEL_RADIUS = 16
const BUTTON_RADIUS = 8

// Cuanto hay que mover y encoger el panel (siempre centrado en la pantalla) para que
// quede exactamente encima del boton
function transformToButton(panel: HTMLElement, button: HTMLElement) {
  const rect = button.getBoundingClientRect()
  const scaleX = rect.width / panel.offsetWidth
  const scaleY = rect.height / panel.offsetHeight
  return {
    x: rect.left + rect.width / 2 - window.innerWidth / 2,
    y: rect.top + rect.height / 2 - window.innerHeight / 2,
    scaleX,
    scaleY,
    // Al encoger, las esquinas tambien se encogen; esto las compensa para que se vean como las del boton
    borderRadius: `${BUTTON_RADIUS / scaleX}px / ${BUTTON_RADIUS / scaleY}px`,
  }
}

type PanelProps = {
  origin: HTMLElement
  onClose: () => void
  title: string
  description: string
  children: ReactNode
  swipeUpToClose?: boolean
}

// Cuanto hay que mover la ventana (px) o que tan rapido (px/s) para que se cierre al soltarla
const CLOSE_DISTANCE = 100
const CLOSE_VELOCITY = 600

function MorphPanel({ origin, onClose, title, description, children, swipeUpToClose = false }: PanelProps) {
  const titleId = useId()
  const descriptionId = useId()
  useModalBehavior(onClose)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [isPresent, safeToRemove] = usePresence()
  const reduceMotion = useReducedMotion()

  // Al abrir: el panel empieza encima del boton y crece hasta el centro
  useLayoutEffect(() => {
    const panel = scope.current
    animate(panel, { opacity: [0, 1] }, { duration: 0.1 })
    if (reduceMotion) return
    const start = transformToButton(panel, origin)
    animate(
      panel,
      {
        x: [start.x, 0],
        y: [start.y, 0],
        scaleX: [start.scaleX, 1],
        scaleY: [start.scaleY, 1],
        borderRadius: [start.borderRadius, `${PANEL_RADIUS}px / ${PANEL_RADIUS}px`],
      },
      openSpring,
    )
  }, [animate, scope, origin, reduceMotion])

  // Deslizar para cerrar (solo con el dedo): la ventana sigue al dedo y, al soltarla, sale por ese lado
  // o regresa a su lugar. Desde la agarradera o el titulo se puede hacia arriba o hacia abajo; desde
  // cualquier otra parte, solo hacia abajo y estando hasta arriba del contenido (asi no estorba al
  // desplazar el formulario). Se usan eventos de toque para poder frenar el desplazamiento de iPhone
  const swipedAway = useRef(false)
  // La ventana puede recibir una funcion nueva en cada render; asi el arrastre no se reinicia
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    const panel = scope.current
    if (!swipeUpToClose || !panel) return
    let start: { y: number; fromZone: boolean; atTop: boolean } | null = null
    let dragging = false
    let last = { y: 0, time: 0, velocity: 0 }

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return
      const y = event.touches[0].clientY
      const fromZone = !!(event.target as HTMLElement).closest('[data-swipe-zone]')
      start = { y, fromZone, atTop: panel.scrollTop <= 0 }
      dragging = false
      last = { y, time: event.timeStamp, velocity: 0 }
    }
    const onMove = (event: TouchEvent) => {
      if (!start) return
      const y = event.touches[0].clientY
      const dy = y - start.y
      if (!dragging) {
        if (Math.abs(dy) < 6) return
        dragging = start.fromZone || (start.atTop && dy > 0)
        if (!dragging) {
          start = null
          return
        }
      }
      event.preventDefault()
      last = { y, time: event.timeStamp, velocity: ((y - last.y) / Math.max(1, event.timeStamp - last.time)) * 1000 }
      animate(panel, { y: dy }, { duration: 0 })
    }
    const onEnd = () => {
      if (!start || !dragging) {
        start = null
        return
      }
      const dy = last.y - start.y
      start = null
      dragging = false
      const fast = Math.abs(last.velocity) > CLOSE_VELOCITY
      if (Math.abs(dy) > CLOSE_DISTANCE || fast) {
        swipedAway.current = true
        const up = fast ? last.velocity < 0 : dy < 0
        animate(panel, { y: up ? -window.innerHeight : window.innerHeight, opacity: 0 }, { duration: 0.25, ease: 'easeOut' })
        closeRef.current()
      } else {
        animate(panel, { y: 0 }, openSpring)
      }
    }
    panel.addEventListener('touchstart', onStart, { passive: true })
    panel.addEventListener('touchmove', onMove, { passive: false })
    panel.addEventListener('touchend', onEnd)
    panel.addEventListener('touchcancel', onEnd)
    return () => {
      panel.removeEventListener('touchstart', onStart)
      panel.removeEventListener('touchmove', onMove)
      panel.removeEventListener('touchend', onEnd)
      panel.removeEventListener('touchcancel', onEnd)
    }
  }, [swipeUpToClose, scope, animate])

  // Al cerrar: hace el camino de regreso y se desvanece justo al llegar al boton
  useEffect(() => {
    if (isPresent) return
    const panel = scope.current
    // Si se cerro deslizandola, ya va saliendo por arriba: solo espera a que termine
    if (swipedAway.current) {
      const timer = setTimeout(safeToRemove, 250)
      return () => clearTimeout(timer)
    }
    if (!reduceMotion) animate(panel, transformToButton(panel, origin), openSpring)
    // Se quita en cuanto termina de desvanecerse (sin esperar el final del rebote)
    animate(panel, { opacity: 0 }, { delay: 0.2, duration: 0.1 }).then(safeToRemove)
  }, [isPresent, animate, scope, origin, reduceMotion, safeToRemove])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={scope}
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={{ opacity: 0, borderRadius: PANEL_RADIUS }}
          // Mientras se cierra ya no recibe clics, para no bloquear la pagina
          // La ventana se sigue pudiendo desplazar, pero sin mostrar la barrita de scroll
          className={cn(
            'relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border bg-popover p-4 text-sm text-popover-foreground',
            isPresent ? 'pointer-events-auto' : 'pointer-events-none',
          )}
        >
          {/* El contenido aparece un instante despues de que la ventana se abre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="grid gap-4"
          >
            {/* Agarradera en celular: de aqui se desliza hacia arriba o hacia abajo para cerrar */}
            {swipeUpToClose && (
              <div
                aria-hidden
                data-swipe-zone
                className="-mx-4 -mt-4 -mb-2 flex h-6 touch-none cursor-grab justify-center pt-2 md:hidden"
              >
                <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>
            )}
            <div data-swipe-zone={swipeUpToClose || undefined} className={cn('flex flex-col gap-2', swipeUpToClose && 'max-md:touch-none')}
            >
              <h2 id={titleId} className="text-base leading-none font-medium">
                {title}
              </h2>
              <p id={descriptionId} className="text-muted-foreground">
                {description}
              </p>
            </div>
            {/* El contenido vive dentro de la ventana: al cerrarla se borra lo que se habia llenado */}
            {children}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="absolute top-2 right-2"
            >
              <X />
              <span className="sr-only">Cerrar</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  )
}
