import { useEffect, useRef } from 'react'

// Da una direccion temporal (blob:) para ver cada foto, siempre la misma para la misma foto. Si se
// recreara en cada cambio, Firefox intenta recargar la direccion vieja ya liberada y la foto se rompe.
// Se liberan solo las de fotos quitadas, y todas al desmontar (con un respiro, porque React en
// desarrollo desmonta y vuelve a montar al abrir)
export function useObjectUrls(files: File[]) {
  const urls = useRef(new Map<File, string>())
  const mounted = useRef(false)

  useEffect(() => {
    for (const [file, url] of urls.current) {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url)
        urls.current.delete(file)
      }
    }
  }, [files])

  useEffect(() => {
    mounted.current = true
    const cache = urls.current
    return () => {
      mounted.current = false
      setTimeout(() => {
        if (mounted.current) return
        cache.forEach((url) => URL.revokeObjectURL(url))
        cache.clear()
      })
    }
  }, [])

  return (file: File) => {
    let url = urls.current.get(file)
    if (!url) {
      url = URL.createObjectURL(file)
      urls.current.set(file, url)
    }
    return url
  }
}
