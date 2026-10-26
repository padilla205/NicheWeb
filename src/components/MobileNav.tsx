import { Plus } from 'lucide-react'
import { animate, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useSession } from '@/hooks/useAuth'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'
import { AddItemDialog } from '@/pages/closet/AddItemDialog'
import { PublishPostDialog } from '@/pages/feed/PublishPostDialog'
import { CreateListingDialog } from '@/pages/marketplace/CreateListingDialog'

// Pixeles que hay que desplazarse en un sentido antes de esconder o mostrar la barra (evita temblores)
const SCROLL_THRESHOLD = 8
// Cerca del inicio de la pagina la barra siempre se ve
const TOP_ZONE = 64

const morph = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const
const slide = { type: 'spring', visualDuration: 0.35, bounce: 0.2 } as const

type Creating = 'item' | 'listing' | 'post'

// Barra flotante de secciones para celular: una pastilla oscura con los iconos y, en la seccion
// activa, su nombre dentro de una pastilla clara que se desliza y se estira de una a otra.
// Al lado, un boton "+" para crear segun la seccion. Se esconde al bajar y vuelve al subir
export function MobileNav() {
  const { pathname } = useLocation()
  const session = useSession()
  const activeIndex = sections.findIndex((s) => pathname.startsWith(s.path))
  const navigate = useNavigate()
  // Mientras arrastras el dedo, la seccion que queda debajo (null si no estas arrastrando)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const dragged = useRef(false)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  // La pastilla va a la seccion bajo el dedo, o a la activa
  const shownIndex = dragIndex ?? activeIndex

  // Seccion cuyo centro queda mas cerca del dedo
  function indexAt(clientX: number) {
    let best = 0
    let bestDistance = Infinity
    itemRefs.current.forEach((item, i) => {
      if (!item) return
      const rect = item.getBoundingClientRect()
      const distance = Math.abs(clientX - (rect.left + rect.width / 2))
      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    })
    return best
  }

  function endDrag() {
    if (dragIndex !== null && dragIndex !== activeIndex) navigate(sections[dragIndex].path)
    setDragIndex(null)
  }
  const navRef = useRef<HTMLDivElement>(null)
  const [hidden, setHidden] = useState(false)
  // Que se esta creando y el boton "+" de donde crece la ventana
  const [creating, setCreating] = useState<{ kind: Creating; origin: HTMLElement } | null>(null)
  const closeCreate = useCallback(() => setCreating(null), [])

  useEffect(() => {
    let lastY = window.scrollY
    function onScroll() {
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < SCROLL_THRESHOLD) return
      // Bajando se esconde; subiendo, o cerca del inicio, se muestra
      setHidden(delta > 0 && y > TOP_ZONE)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Al cambiar de seccion siempre se ve
  useEffect(() => setHidden(false), [pathname])

  // Baja hasta salir de la pantalla (offsetTop no cuenta el movimiento ya aplicado) y sube con resorte
  useEffect(() => {
    const nav = navRef.current
    if (nav) animate(nav, { y: hidden ? window.innerHeight - nav.offsetTop + 8 : 0 }, slide)
  }, [hidden])

  // El "+" crea lo que corresponde a la seccion: prenda en el closet, venta en el marketplace y
  // publicacion en las demas
  const kind: Creating = pathname.startsWith('/closet')
    ? 'item'
    : pathname.startsWith('/marketplace')
      ? 'listing'
      : 'post'
  const createLabel = { item: 'Agregar prenda', listing: 'Crear venta', post: 'Crear publicacion' }[kind]

  return (
    <>
      <div
        ref={navRef}
        className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-10 flex items-center gap-2 md:hidden"
      >
        {/* Arrastrar el dedo sobre la barra mueve la pastilla; al soltar lleva a esa seccion */}
        <motion.nav
          aria-label="Secciones"
          onPointerDown={() => (dragged.current = false)}
          onPanStart={(_, info) => {
            dragged.current = true
            setDragIndex(indexAt(info.point.x - window.scrollX))
          }}
          onPan={(_, info) => setDragIndex(indexAt(info.point.x - window.scrollX))}
          onPanEnd={endDrag}
          style={{ touchAction: 'none' }}
          className="liquid-glass nav-ceramic relative flex min-w-0 flex-1 items-center justify-between rounded-full p-1.5 text-white"
        >
          {sections.map(({ path, label, shortLabel, icon: Icon }, i) => {
            const active = i === activeIndex
            // Mientras arrastras solo se ven iconos, asi nada cambia de ancho bajo el dedo
            const expanded = active && dragIndex === null
            return (
              <motion.div
                key={path}
                ref={(element) => {
                  itemRefs.current[i] = element
                }}
                layout
                transition={morph}
                className="relative"
              >
                {/* La pastilla clara es una sola: se desliza a la seccion activa (o a la del dedo) */}
                {i === shownIndex && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={morph}
                    style={{ borderRadius: 999 }}
                    className="liquid-glass-pill absolute inset-0"
                  />
                )}
                <Link
                  to={path}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  // Despues de arrastrar, al soltar ya se navego: el toque no cuenta como clic
                  onClick={(event) => dragged.current && event.preventDefault()}
                  draggable={false}
                  className={cn(
                    'relative flex h-11 items-center justify-center gap-1.5 rounded-full outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:focus-visible:ring-white/40',
                    expanded ? 'px-3.5' : 'w-11',
                    // Los iconos sin elegir van en gris; la seccion elegida contrasta con su pastilla (carbon o perla)
                    i === shownIndex ? 'text-white dark:text-black' : 'text-neutral-500 active:text-neutral-900 dark:text-neutral-400 dark:active:text-white',
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.08 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {shortLabel ?? label}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </motion.nav>

        {/* Sin sesion (paginas publicas) no hay nada que crear */}
        {session && (
          // Mientras la ventana esta abierta el boton se esconde (la ventana sale de el). Al cerrar,
          // cuando la ventana termina de encogerse sobre el, la "recoge": aparece chico, se infla
          // un poco de mas y se acomoda, y el + da un cuarto de vuelta de regreso.
          // Escondido conserva su tamano (scale 1) porque la ventana lo mide para saber a donde regresar
          <motion.button
            type="button"
            aria-label={createLabel}
            title={createLabel}
            onClick={(event) => setCreating({ kind, origin: event.currentTarget })}
            whileTap={{ scale: 0.92 }}
            initial={false}
            animate={
              creating
                ? { opacity: 0, scale: 1, transition: { duration: 0 } }
                : {
                    opacity: 1,
                    scale: [0.7, 1.12, 0.97, 1],
                    transition: {
                      opacity: { delay: 0.2, duration: 0.08 },
                      scale: { delay: 0.2, duration: 0.42, ease: 'easeOut', times: [0, 0.45, 0.75, 1] },
                    },
                  }
            }
            className={cn(
              'liquid-glass nav-ceramic-create relative flex size-14 shrink-0 items-center justify-center rounded-full text-white dark:text-black outline-none focus-visible:ring-3 focus-visible:ring-white/40',
              creating && 'pointer-events-none',
            )}
          >
            <motion.span
              initial={false}
              animate={creating ? { rotate: 90 } : { rotate: 0 }}
              transition={creating ? { duration: 0 } : { delay: 0.2, type: 'spring', visualDuration: 0.4, bounce: 0.3 }}
              className="flex"
            >
              <Plus className="size-6" />
            </motion.span>
          </motion.button>
        )}
      </div>

      <AddItemDialog origin={creating?.kind === 'item' ? creating.origin : null} onClose={closeCreate} />
      <CreateListingDialog origin={creating?.kind === 'listing' ? creating.origin : null} onClose={closeCreate} />
      <PublishPostDialog origin={creating?.kind === 'post' ? creating.origin : null} onClose={closeCreate} />
    </>
  )
}
