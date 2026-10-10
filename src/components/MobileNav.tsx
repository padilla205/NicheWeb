import { animate, motion, type MotionValue, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { type Section, sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

// Separacion horizontal entre iconos y radio de la curva (mas chico = curva mas cerrada)
const SPACING = 68
const RADIUS = 420
// Tiempo sin tocar la barra antes de que se esconda
const HIDE_AFTER_MS = 3000

const snap = { type: 'spring', duration: 0.3, bounce: 0.15 } as const

function clampIndex(i: number) {
  return Math.min(sections.length - 1, Math.max(0, i))
}

// Barra de secciones para celular: los iconos corren sobre un arco y el del centro es el activo
export function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeIndex = Math.max(0, sections.findIndex((s) => pathname.startsWith(s.path)))

  // Posicion continua del carrusel: 0 = primera seccion al centro, 1 = la segunda, etc.
  const position = useMotionValue(activeIndex)
  const dragStart = useRef(0)
  const dragged = useRef(false)
  // El toque que vuelve a mostrar la barra no gira el carrusel ni cambia de seccion
  const revealing = useRef(false)

  // La barra se esconde sola; queda una pestana abajo que la vuelve a mostrar al tocarla
  const [hidden, setHidden] = useState(false)
  const hideTimer = useRef<number>(undefined)
  const wake = useCallback(() => {
    setHidden(false)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setHidden(true), HIDE_AFTER_MS)
  }, [])

  useEffect(() => {
    hideTimer.current = window.setTimeout(() => setHidden(true), HIDE_AFTER_MS)
    return () => window.clearTimeout(hideTimer.current)
  }, [])

  // Si la ruta cambia por otro lado (un link), el arco gira hasta esa seccion
  useEffect(() => {
    animate(position, activeIndex, snap)
  }, [activeIndex, position])

  function goTo(index: number) {
    const target = clampIndex(index)
    animate(position, target, snap)
    if (target !== activeIndex) navigate(sections[target].path)
  }

  return (
    <motion.nav
      aria-label="Secciones"
      className={cn(
        'fixed inset-x-0 bottom-0 z-10 h-[calc(5.5rem+env(safe-area-inset-bottom))] touch-none overflow-hidden rounded-t-[50%_2.5rem] border-t-2 bg-background transition-transform duration-300 ease-out md:hidden',
        hidden && 'translate-y-[calc(100%-1.75rem)]',
      )}
      onPointerDown={() => {
        dragged.current = false
        revealing.current = hidden
        wake()
      }}
      onPointerUp={wake}
      onPanStart={() => {
        dragged.current = true
        dragStart.current = position.get()
      }}
      onPan={(_, info) => {
        if (revealing.current) return
        // Arrastrar a la izquierda avanza a la siguiente seccion; en los extremos frena
        const raw = dragStart.current - info.offset.x / SPACING
        const edge = clampIndex(raw)
        position.set(edge + (raw - edge) / 3)
      }}
      onPanEnd={(_, info) => {
        if (revealing.current) return
        // Un deslizamiento rapido avanza aunque el dedo haya recorrido poco
        goTo(Math.round(position.get() - info.velocity.x / 1500))
      }}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/50 transition-opacity duration-300',
          !hidden && 'opacity-0',
        )}
      />
      <ul className={cn('relative h-full transition-opacity duration-300', hidden && 'opacity-0')}>
        {sections.map((section, i) => (
          <ArcItem
            key={section.path}
            section={section}
            index={i}
            position={position}
            active={i === activeIndex}
            onSelect={() => !dragged.current && !revealing.current && goTo(i)}
          />
        ))}
      </ul>
    </motion.nav>
  )
}

type ArcItemProps = {
  section: Section
  index: number
  position: MotionValue<number>
  active: boolean
  onSelect: () => void
}

function ArcItem({ section: { label, icon: Icon }, index, position, active, onSelect }: ArcItemProps) {
  // Distancia en pixeles desde el centro de la pantalla
  const x = useTransform(position, (p) => (index - p) * SPACING)
  // Cuanto baja el icono al alejarse del centro, siguiendo un circulo
  const y = useTransform(x, (d) => RADIUS - Math.sqrt(Math.max(0, RADIUS ** 2 - d ** 2)))
  const rotate = useTransform(x, (d) => (Math.asin(Math.max(-1, Math.min(1, d / RADIUS))) * 180) / Math.PI)
  const scale = useTransform(x, (d) => Math.max(0.75, 1.25 - Math.abs(d) / SPACING / 4))
  const opacity = useTransform(x, (d) => Math.max(0, 1 - Math.abs(d) / (SPACING * 3)))
  const labelOpacity = useTransform(x, (d) => Math.max(0, 1 - Math.abs(d) / (SPACING / 2)))

  return (
    <motion.li className="absolute top-3 left-1/2 -ml-7 w-14" style={{ x, y, rotate, scale, opacity }}>
      <button
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onClick={onSelect}
        className={cn('flex w-full flex-col items-center gap-1 text-muted-foreground', active && 'text-foreground')}
      >
        <span className={cn('flex size-11 items-center justify-center rounded-full', active && 'bg-accent')}>
          <Icon className="size-5" />
        </span>
        <motion.span className="text-[11px] font-medium whitespace-nowrap" style={{ opacity: labelOpacity }}>
          {label}
        </motion.span>
      </button>
    </motion.li>
  )
}
