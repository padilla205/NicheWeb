import { Plus, Sparkles, Store } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

const shortcutClass =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground'

export function SideNav() {
  return (
    <nav
      aria-label="Secciones"
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-l-2 p-3 md:block"
    >
      <ul className="flex flex-col gap-1">
        {sections.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground',
                  isActive && 'bg-accent text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Atajos, solo en escritorio grande: llevan a funciones que ya existen */}
      <div className="mt-6 hidden border-t pt-4 lg:block">
        <h2 className="px-3 pb-2 text-xs font-medium text-muted-foreground">Atajos</h2>
        <ul className="flex flex-col gap-1">
          <li>
            {/* Abre "Agregar prenda" en el closet; la ventana crece desde este atajo */}
            <Link to="/closet" state={{ addItem: true }} data-shortcut="agregar-prenda" className={shortcutClass}>
              <Plus className="size-4" />
              Agregar prenda
            </Link>
          </li>
          <li>
            <Link to="/outfits" className={shortcutClass}>
              <Sparkles className="size-4" />
              Crear outfit
            </Link>
          </li>
          <li>
            <Link to="/marketplace" className={shortcutClass}>
              <Store className="size-4" />
              Explorar marketplace
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
