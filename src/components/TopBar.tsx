import { MessageCircle, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 grid h-[calc(4rem+env(safe-area-inset-top))] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b-2 bg-background px-4 pt-[env(safe-area-inset-top)] md:grid-cols-[1fr_minmax(0,36rem)_1fr] md:gap-6 md:px-6">
      <Link to="/" className="justify-self-start text-xl font-semibold tracking-tight">
        Niche
      </Link>
      <div className="relative min-w-0 w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar prendas, outfits o personas"
          aria-label="Buscar"
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <NavLink
          to="/chat"
          aria-label="Mensajes"
          title="Mensajes"
          className={({ isActive }) =>
            cn(
              'flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:active:scale-[0.96] motion-reduce:transition-none',
              isActive && 'bg-accent text-foreground',
            )
          }
        >
          <MessageCircle aria-hidden="true" className="size-5" />
        </NavLink>
        <ThemeToggle />
      </div>
    </header>
  )
}
