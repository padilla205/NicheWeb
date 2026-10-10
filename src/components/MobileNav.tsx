import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

// Tiempo sin tocar la barra antes de que se esconda
const HIDE_AFTER_MS = 3000

const snap = { type: 'spring', duration: 0.3, bounce: 0.15 } as const
const slide = { type: 'spring', visualDuration: 0.35, bounce: 0.2 } as const

function clampIndex(i: number) {
  return Math.min(sections.length - 1, Math.max(0, i))
}

// Barra flotante de secciones para celular: una pastilla clara se arrastra con el dedo sobre
// los iconos y al soltarla lleva a la seccion donde quedo. Se esconde sola tras unos segundos
export function MobileNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeIndex = sections.findIndex((s) => pathname.startsWith(s.path))

  // Posicion continua de la pastilla: 0 = primera seccion, 1 = la segunda, etc.
  const position = useMotionValue(Math.max(0, activeIndex))
  const pillX = useTransform(position, (p) => `${p * 100}%`)
  const navRef = useRef<HTMLElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)

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

  // Baja hasta salir de la pantalla (offsetTop no cuenta el movimiento ya aplicado) y sube con resorte
  useEffect(() => {
    const nav = navRef.current
    if (nav) animate(nav, { y: hidden ? window.innerHeight - nav.offsetTop + 8 : 0 }, slide)
  }, [hidden])

  // Si la ruta cambia por otro lado (un link), la pastilla va hasta esa seccion
  useEffect(() => {
    if (activeIndex >= 0) animate(position, activeIndex, snap)
  }, [activeIndex, position])

  function goTo(index: number) {
    const target = clampIndex(index)
    animate(position, target, snap)
    if (target !== activeIndex) navigate(sections[target].path)
  }

  // Seccion (con decimales) que queda bajo el dedo
  function indexAt(clientX: number) {
    const rect = rowRef.current!.getBoundingClientRect()
    return ((clientX - rect.left) / rect.width) * sections.length - 0.5
  }

  return (
    <>
      <motion.nav
        ref={navRef}
        aria-label="Secciones"
        className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-10 touch-none rounded-full border border-white/10 bg-neutral-900 p-2 text-white shadow-lg md:hidden"
        onPointerDown={() => {
          dragged.current = false
          wake()
        }}
        onPointerUp={wake}
        onPanStart={() => (dragged.current = true)}
        // La pastilla sigue al dedo; fuera de los extremos se queda en el borde
        onPan={(event) => position.set(clampIndex(indexAt(event.clientX)))}
        onPanEnd={() => goTo(Math.round(position.get()))}
      >
        <div ref={rowRef} className="relative">
          {/* Mide lo mismo que una seccion y se mueve en saltos de su propio ancho */}
          {activeIndex >= 0 && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 px-1"
              style={{ x: pillX, width: `${100 / sections.length}%` }}
            >
              <span className="block size-full rounded-full bg-white/15" />
            </motion.div>
          )}
          <ul
            className="relative grid"
            style={{ gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))` }}
          >
            {sections.map(({ path, label, icon: Icon }, i) => (
              <li key={path}>
                <button
                  type="button"
                  aria-label={label}
                  aria-current={i === activeIndex ? 'page' : undefined}
                  onClick={() => !dragged.current && goTo(i)}
                  className="flex h-12 w-full items-center justify-center"
                >
                  <Icon className="size-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.nav>

      {/* Escondida: al poner el dedo en la orilla de abajo de la pantalla vuelve a subir */}
      {/* Siempre montada para que el toque que la sube no caiga en lo que hay debajo */}
      <div
        aria-hidden
        onPointerDown={wake}
        className={cn(
          'fixed inset-x-0 bottom-0 z-10 h-[calc(2.5rem+env(safe-area-inset-bottom))] md:hidden',
          !hidden && 'pointer-events-none',
        )}
      />
    </>
  )
}
