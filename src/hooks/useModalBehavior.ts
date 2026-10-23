import { useEffect, useRef } from 'react'

// Ventanas abiertas, de la mas vieja a la mas nueva: Escape solo cierra la de encima
const openModals: symbol[] = []
// Como estaba el scroll de la pagina antes de abrir la primera ventana
let savedOverflow = ''

// Comportamiento comun de las ventanas que se abren encima de la pagina:
// Escape cierra, la pagina de atras no se mueve y al cerrar el foco regresa a donde estaba
export function useModalBehavior(onClose: () => void) {
  // Se guarda la funcion mas reciente sin reiniciar la ventana: si el efecto dependiera de onClose,
  // cada vez que la pagina de atras se actualiza (por ejemplo, el reloj de Destacados cada segundo)
  // la ventana se "reabriria" y regresaria el foco a donde estaba, cerrando menus abiertos adentro
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

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
      // Si hay una ventana encima (pantalla completa, compartir...), Escape solo cierra esa
      if (document.querySelector('[data-slot="dialog-content"]')) return
      onCloseRef.current()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      openModals.splice(openModals.indexOf(id), 1)
      window.removeEventListener('keydown', handleKey)
      // Solo la ultima en cerrarse devuelve el scroll (el orden de cierre puede variar)
      if (openModals.length === 0) document.body.style.overflow = savedOverflow
      previousFocus?.focus()
    }
  }, [])
}
