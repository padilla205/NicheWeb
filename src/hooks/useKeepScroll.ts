import { useRef, useState } from 'react'

// Al cambiar de seccion o filtro, la zona de contenido no se encoge por arriba de lo que estabas
// viendo: si el contenido nuevo es mas corto (o aun esta cargando), el navegador ya no sube la pagina.
// Solo guarda el alto necesario para la pantalla actual, asi no queda espacio vacio de mas
export function useKeepScroll(key: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({ key, minHeight: 0 })

  if (state.key !== key) {
    // Se mide antes de que React cambie el contenido: es lo que esta en pantalla ahora mismo
    const top = ref.current?.getBoundingClientRect().top ?? window.innerHeight
    setState({ key, minHeight: Math.max(0, window.innerHeight - top) })
  }

  return { ref, style: state.minHeight ? { minHeight: state.minHeight } : undefined }
}
