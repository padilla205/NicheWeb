import { useEffect } from 'react'

// Ventanas abiertas, de la mas vieja a la mas nueva: Escape solo cierra la de encima
const openModals: symbol[] = []
// Como estaba el scroll de la pagina antes de abrir la primera ventana
let savedOverflow = ''

// Comportamiento comun de las ventanas que se abren encima de la pagina:
// Escape cierra, la pagina de atras no se mueve y al cerrar el foco regresa a donde estaba
export function useModalBehavior(onClose: () => void) {
  useEffect(() => {
    const id = Symbol()
    if (openModals.length === 0) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openModals.push(id)
    const previousFocus = document.activeElement as HTMLElement | null

    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || openModals.at(-1) !== id) return
      // Si hay una lista desplegable abierta (tipo de prenda, equipo...), Escape solo cierra esa lista
      if (document.querySelector('[data-radix-popper-content-wrapper]')) return
      onClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      openModals.splice(openModals.indexOf(id), 1)
      window.removeEventListener('keydown', handleKey)
      // Solo la ultima en cerrarse devuelve el scroll (el orden de cierre puede variar)
      if (openModals.length === 0) document.body.style.overflow = savedOverflow
      previousFocus?.focus()
    }
  }, [onClose])
}
