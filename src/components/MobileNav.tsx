import { animate, motion, type MotionValue, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { type Section, sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

// Tiempo sin tocar la barra antes de que se esconda
const HIDE_AFTER_MS = 3000
// Lo que queda visible de la barra escondida (la pestana para volver a sacarla)
const PEEK_PX = 28

const snap = { type: 'spring', duration: 0.3, bounce: 0.15 } as const
const slide = { type: 'spring', visualDuration: 0.35, bounce: 0.2 } as const

function clampIndex(i: number) {
  return Math.min(sections.length - 1, Math.max(0, i))
}

// Barra de secciones para celular: un circulo de color se arrastra con el dedo sobre los iconos
// y al soltarlo lleva a la seccion donde quedo
export function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeIndex = Math.max(0, sections.findIndex((s) => pathname.startsWith(s.path)))

  // Posicion continua del circulo: 0 = primera seccion, 1 = la segunda, etc.
  const position = useMotionValue(activeIndex)
  const circleX = useTransform(position, (p) => `${p * 100}%`)
  const navRef = useRef<HTMLElement>(null)
  const dragged = useRef(false)
  // El toque que vuelve a mostrar la barra no mueve el circulo ni cambia de seccion
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

  // Sube y baja con resorte; se mide la altura porque incluye la zona segura del celular
  useEffect(() => {
    const nav = navRef.current
    if (nav) animate(nav, { y: hidden ? nav.offsetHeight - PEEK_PX : 0 }, slide)
  }, [hidden])

  // Si la ruta cambia por otro lado (un link), el circulo va hasta esa seccion
  useEffect(() => {
    animate(position, activeIndex, snap)
  }, [activeIndex, position])

  function goTo(index: number) {
    const target = clampIndex(index)
    animate(position, target, snap)
    if (target !== activeIndex) navigate(sections[target].path)
  }

  // Seccion (con decimales) que queda bajo el dedo
  function indexAt(clientX: number) {
    const rect = navRef.current!.getBoundingClientRect()
    return ((clientX - rect.left) / rect.width) * sections.length - 0.5
  }

  return (
    <motion.nav
      ref={navRef}
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 touch-none border-t-2 bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      onPointerDown={() => {
        dragged.current = false
        revealing.current = hidden
        wake()
      }}
      onPointerUp={wake}
      onPanStart={() => (dragged.current = true)}
      onPan={(event) => {
        // El circulo sigue al dedo; fuera de los extremos se queda en el borde
        if (!revealing.current) position.set(clampIndex(indexAt(event.clientX)))
      }}
      onPanEnd={() => {
        if (!revealing.current) goTo(Math.round(position.get()))
      }}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/50 transition-opacity duration-300',
          !hidden && 'opacity-0',
        )}
      />
      <div className={cn('relative transition-opacity duration-300', hidden && 'opacity-0')}>
        {/* Circulo de color: mide lo mismo que una seccion y se mueve en saltos de su propio ancho */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 flex w-1/6 justify-center pt-2"
          style={{ x: circleX }}
        >
          <span className="size-11 rounded-full bg-primary shadow-md" />
        </motion.div>
        <ul className="relative grid grid-cols-6">
          {sections.map((section, i) => (
            <NavItem
              key={section.path}
              section={section}
              index={i}
              position={position}
              active={i === activeIndex}
              onSelect={() => !dragged.current && !revealing.current && goTo(i)}
            />
          ))}
        </ul>
      </div>
    </motion.nav>
  )
}

type NavItemProps = {
  section: Section
  index: number
  position: MotionValue<number>
  active: boolean
  onSelect: () => void
}

function NavItem({ section: { label, icon: Icon }, index, position, active, onSelect }: NavItemProps) {
  // El icono cambia de color mientras el circulo pasa por encima
  const iconColor = useTransform(position, (p) =>
    Math.abs(p - index) < 0.5 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
  )

  return (
    <li>
      <button
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onClick={onSelect}
        className={cn(
          'flex w-full flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground',
          active && 'text-foreground',
        )}
      >
        <motion.span className="flex size-11 items-center justify-center" style={{ color: iconColor }}>
          <Icon className="size-5" />
        </motion.span>
        <span className="whitespace-nowrap">{label}</span>
      </button>
    </li>
  )
}
