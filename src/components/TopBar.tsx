import { ArrowLeft, MessageCircle, Search, X } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router'
import { NotificationBell } from '@/components/NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UnreadBadge } from '@/components/UnreadBadge'
import { useChatMutes, useChatRealtime, useUnreadCounts } from '@/hooks/useChat'
import { topBarIconClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

// La lupa y la barra de busqueda son la misma pieza: al entrar a Buscar la lupa se estira hasta
// volverse la barra, y al salir se encoge de regreso
const SEARCH_ID = 'topbar-search'
const morph = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const

export function TopBar() {
  useChatRealtime()
  const { pathname } = useLocation()
  const searching = pathname === '/buscar'
  // Los chats silenciados no suman
  const mutes = useChatMutes()
  const unread = Object.entries(useUnreadCounts()).reduce((sum, [chat, count]) => (mutes.has(chat) ? sum : sum + count), 0)

  return (
    <MotionConfig reducedMotion="user">
      <header className="topbar-ceramic sticky top-0 z-10 flex h-[calc(4rem+env(safe-area-inset-top))] items-center gap-2 border-b-2 bg-background px-4 pt-[env(safe-area-inset-top)] md:gap-6 md:px-6">
        {/* En celular, mientras buscas, el logo deja su lugar a la flecha para regresar */}
        <Link
          to="/"
          className={cn('shrink-0 text-xl font-semibold tracking-tight', searching && 'hidden md:block')}
        >
          Niche
        </Link>
        {searching && <BackButton />}

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
          {searching ? (
            <SearchField />
          ) : (
            <motion.div layoutId={SEARCH_ID} transition={morph} style={{ borderRadius: 999 }}>
              <Link to="/buscar" aria-label="Buscar" title="Buscar" className={topBarIconClass}>
                <Search aria-hidden="true" className="size-5" />
              </Link>
            </motion.div>
          )}

          <div className={cn('flex shrink-0 items-center gap-1', searching && 'hidden md:flex')}>
            <NotificationBell />
            <NavLink
              to="/chat"
              aria-label={unread ? `Mensajes, ${unread} sin leer` : 'Mensajes'}
              title="Mensajes"
              className={({ isActive }) => cn(topBarIconClass, isActive && 'bg-accent text-foreground')}
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              <UnreadBadge count={unread} className="absolute top-0 right-0" />
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </MotionConfig>
  )
}

// Regresa a la pantalla anterior; si se abrio Buscar directo (sin historial), al closet
function useLeaveSearch() {
  const navigate = useNavigate()
  return () => (window.history.length > 1 ? navigate(-1) : navigate('/closet'))
}

function BackButton() {
  const leave = useLeaveSearch()
  return (
    <button type="button" onClick={leave} aria-label="Regresar" className={cn(topBarIconClass, 'md:hidden')}>
      <ArrowLeft aria-hidden="true" className="size-5" />
    </button>
  )
}

// Barra de busqueda: lo que escribes queda en el link (/buscar?q=...), asi se puede compartir y regresar
function SearchField() {
  const [params, setParams] = useSearchParams()
  // La caja guarda lo que escribes y solo lo copia al link: si leyera directo del link, al
  // escribir rapido se perderian letras (el link se actualiza un instante despues)
  const [text, setText] = useState(() => params.get('q') ?? '')
  const leave = useLeaveSearch()

  function change(next: string) {
    setText(next)
    setParams(next ? { q: next } : {}, { replace: true })
  }

  return (
    <motion.div
      layoutId={SEARCH_ID}
      transition={morph}
      style={{ borderRadius: 999 }}
      className="flex h-10 w-full min-w-0 max-w-xl items-center gap-2 border bg-card px-3 md:mx-auto"
    >
      {/* El contenido aparece cuando la lupa ya se esta estirando */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={text}
          onChange={(event) => change(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && leave()}
          autoFocus
          placeholder="Buscar personas, ventas u outfits"
          aria-label="Buscar"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            onClick={() => change('')}
            aria-label="Borrar busqueda"
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
