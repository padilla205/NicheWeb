import { NavLink } from 'react-router'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

// En celular es una barra fija abajo; desde md es el menu lateral
export function SideNav() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-10 border-t-2 bg-background px-1 pb-[env(safe-area-inset-bottom)] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-56 md:shrink-0 md:border-t-0 md:border-l-2 md:p-3"
    >
      <ul className="flex md:flex-col md:gap-1">
        {sections.map(({ path, label, icon: Icon }) => (
          <li key={path} className="flex-1">
            <NavLink
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-md py-2 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground md:flex-row md:gap-3 md:px-3 md:text-sm md:hover:bg-accent',
                  isActive && 'text-foreground md:bg-accent',
                )
              }
            >
              <Icon className="size-5 md:size-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
