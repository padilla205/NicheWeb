import { useEffect } from 'react'

// Comportamiento comun de las ventanas que se abren encima de la pagina:
// Escape cierra, la pagina de atras no se mueve y al cerrar el foco regresa a donde estaba
export function useModalBehavior(onClose: () => void) {
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Si hay una lista desplegable abierta (tipo de prenda, equipo...), Escape solo cierra esa lista
      if (document.querySelector('[data-radix-popper-content-wrapper]')) return
      onClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])
}
