import { useEffect, useRef } from 'react'

// Grabacion real de la app dentro de un iPhone dibujado. Solo se reproduce mientras esta en
// pantalla (y no si el sistema pide menos movimiento), para no gastar bateria ni datos
export function PhoneVideo({ src, label }: { src: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.play().catch(() => {})
      else element.pause()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative mx-auto w-64 rounded-[3rem] bg-neutral-950 p-2.5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] md:w-72">
      <div className="relative overflow-hidden rounded-[2.4rem] bg-white">
        {/* Barra de estado con la isla, como un iPhone */}
        <div className="relative h-7 bg-white">
          <span className="absolute top-2 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        </div>
        <video ref={video} src={src} muted loop playsInline preload="metadata" aria-label={label} className="block aspect-[390/800] w-full" />
      </div>
    </div>
  )
}
