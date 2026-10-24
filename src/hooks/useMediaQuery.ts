import { useSyncExternalStore } from 'react'

// Si la pantalla cumple una media query (por ejemplo, escritorio grande); se actualiza al cambiar el tamano
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
