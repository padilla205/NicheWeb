import { useEffect, useRef } from 'react'
import type { ShowcasePhoto } from '@/hooks/useShowcasePhotos'

// Celular: dos tiras de fotos que se deslizan solas en sentidos opuestos (en lugar del mosaico 3D
// de la computadora, que en pantalla chica se ve enorme). Se detienen cuando no estan en pantalla
export function PhotoMarquee({ photos }: { photos: ShowcasePhoto[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => element.classList.toggle('marquee-paused', !entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (photos.length === 0) return null
  const half = Math.ceil(photos.length / 2)
  const rows = [photos.slice(0, half), photos.slice(half).length ? photos.slice(half) : photos]

  return (
    <div ref={ref} aria-hidden className="flex flex-col gap-3 overflow-hidden py-2">
      {rows.map((row, r) => (
        // La tira va dos veces seguida: al llegar a la mitad vuelve al inicio sin que se note el salto
        <div key={r} className={r === 0 ? 'marquee flex w-max gap-3' : 'marquee marquee-reverse flex w-max gap-3'}>
          {[...row, ...row, ...row, ...row].map((photo, i) => (
            <img
              key={`${photo.id}-${i}`}
              src={photo.src}
              alt=""
              loading="lazy"
              onError={(event) => (event.currentTarget.style.display = 'none')}
              className="h-48 w-36 shrink-0 rounded-2xl object-cover"
            />
          ))}
        </div>
      ))}
    </div>
  )
}
