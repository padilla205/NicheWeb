import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// Interruptor de modo claro/oscuro: el circulo se desliza y su icono gira al cambiar
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Modo oscuro"
      onClick={toggleTheme}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
        isDark ? 'border-primary bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 flex size-6 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-300 ease-out',
          isDark ? 'translate-x-6' : 'translate-x-0',
        )}
      >
        <Sun
          className={cn(
            'absolute size-3.5 transition-all duration-300',
            isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
          )}
        />
        <Moon
          className={cn(
            'absolute size-3.5 transition-all duration-300',
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
          )}
        />
      </span>
    </button>
  )
}
