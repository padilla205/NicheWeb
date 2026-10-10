import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { sections } from '@/lib/sections'

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
  const activeIndex = Math.max(0, sections.findIndex((s) => pathname.startsWith(s.path)))

  // Posicion continua de la pastilla: 0 = primera seccion, 1 = la segunda, etc.
  const position = useMotionValue(activeIndex)
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
    animate(position, activeIndex, snap)
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
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/6 px-1"
            style={{ x: pillX }}
          >
            <span className="block size-full rounded-full bg-white/15" />
          </motion.div>
          <ul className="relative grid grid-cols-6">
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

      {/* Escondida: queda una rayita abajo; tocarla vuelve a subir la barra */}
      <AnimatePresence>
        {hidden && (
          <motion.button
            type="button"
            aria-label="Mostrar secciones"
            onClick={wake}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 z-10 flex h-8 w-28 -translate-x-1/2 items-center justify-center md:hidden"
          >
            <span className="h-1.5 w-12 rounded-full bg-neutral-900 ring-1 ring-white/20" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
