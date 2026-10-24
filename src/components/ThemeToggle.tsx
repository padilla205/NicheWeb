import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { topBarIconClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

// Boton de modo claro/oscuro con la misma forma que los demas iconos de la barra:
// el sol y la luna giran y se cruzan al cambiar
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Modo oscuro"
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      onClick={toggleTheme}
      className={topBarIconClass}
    >
      <Sun
        aria-hidden
        className={cn(
          'absolute size-5 transition-all duration-300 motion-reduce:transition-none',
          isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          'absolute size-5 transition-all duration-300 motion-reduce:transition-none',
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  )
}
