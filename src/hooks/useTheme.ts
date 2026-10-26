import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'niche-theme'

// Tema guardado por el usuario o, si nunca eligio, el del sistema operativo
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Si el navegador bloquea localStorage, se usa el tema del sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Un solo tema para toda la app: el boton de la barra y el de Mas opciones siempre coinciden
let theme = getInitialTheme()
document.documentElement.classList.toggle('dark', theme === 'dark')
const listeners = new Set<() => void>()

function setTheme(next: Theme) {
  theme = next
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Sin localStorage el tema funciona igual, solo no se recuerda
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, () => theme)
  return { theme: current, toggleTheme: () => setTheme(current === 'dark' ? 'light' : 'dark') }
}
