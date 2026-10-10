import { animate, motion, type MotionValue, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { type Section, sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

// Separacion horizontal entre iconos y radio de la curva (mas chico = curva mas cerrada)
const SPACING = 68
const RADIUS = 420

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
      className="fixed inset-x-0 bottom-0 z-10 h-[calc(5.5rem+env(safe-area-inset-bottom))] touch-none overflow-hidden rounded-t-[50%_2.5rem] border-t-2 bg-background md:hidden"
      onPointerDown={() => (dragged.current = false)}
      onPanStart={() => {
        dragged.current = true
        dragStart.current = position.get()
      }}
      onPan={(_, info) => {
        // Arrastrar a la izquierda avanza a la siguiente seccion; en los extremos frena
        const raw = dragStart.current - info.offset.x / SPACING
        const edge = clampIndex(raw)
        position.set(edge + (raw - edge) / 3)
      }}
      onPanEnd={(_, info) => {
        // Un deslizamiento rapido avanza aunque el dedo haya recorrido poco
        goTo(Math.round(position.get() - info.velocity.x / 1500))
      }}
    >
      <ul className="relative h-full">
        {sections.map((section, i) => (
          <ArcItem
            key={section.path}
            section={section}
            index={i}
            position={position}
            active={i === activeIndex}
            onSelect={() => !dragged.current && goTo(i)}
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
