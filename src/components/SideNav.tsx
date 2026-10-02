import { NavLink } from 'react-router'
import { sections } from '@/lib/sections'
import { cn } from '@/lib/utils'

export function SideNav() {
  return (
    <nav
      aria-label="Secciones"
      className="sticky top-16 h-[calc(100vh-4rem)] w-56 shrink-0 border-l-2 p-3"
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
    </nav>
  )
}
