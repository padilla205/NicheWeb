import { Camera, ImagePlus, SwitchCamera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CameraCaptureProps = {
  onCapture: (file: File) => void
  onPickFromGallery: () => void
  onClose: () => void
}

// Visor de la camara: guia para encuadrar la prenda, boton de disparo, galeria y cambiar de camara.
// La camara se apaga al cerrar el visor. Si no hay camara o no dan permiso, avisa y ofrece subir fotos
export function CameraCapture({ onCapture, onPickFromGallery, onClose }: CameraCaptureProps) {
  const video = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [canFlip, setCanFlip] = useState(false)

  useEffect(() => {
    let stream: MediaStream | undefined
    let cancelled = false
    async function start() {
      setReady(false)
      try {
        const opened = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: false,
        })
        // Si el visor se cerro mientras pedia permiso, la camara no se queda prendida
        if (cancelled) return opened.getTracks().forEach((track) => track.stop())
        stream = opened
        if (video.current) {
          video.current.srcObject = opened
          await video.current.play()
        }
        setReady(true)
        // Los nombres de las camaras solo se conocen despues de dar permiso
        const devices = await navigator.mediaDevices.enumerateDevices()
        if (!cancelled) setCanFlip(devices.filter((device) => device.kind === 'videoinput').length > 1)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [facing])

  function shoot() {
    const element = video.current
    if (!element || !ready) return
    const canvas = document.createElement('canvas')
    canvas.width = element.videoWidth
    canvas.height = element.videoHeight
    canvas.getContext('2d')?.drawImage(element, 0, 0)
    canvas.toBlob(
      (blob) => blob && onCapture(new File([blob], `camara-${Date.now()}.jpg`, { type: 'image/jpeg' })),
      'image/jpeg',
      0.92,
    )
  }

  if (failed) {
    return (
      <div role="alert" className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl bg-muted p-6 text-center">
        <p className="text-sm text-pretty">No se pudo abrir la camara. Revisa el permiso en tu navegador o sube tus fotos.</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={onPickFromGallery}>
            <ImagePlus />
            Subir fotos
          </Button>
        </div>
      </div>
    )
  }

  const controlClass =
    'flex size-11 items-center justify-center rounded-xl bg-white/90 text-black shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-white/70 motion-safe:active:scale-95'

  return (
    <div className="relative aspect-[4/5] max-h-[60dvh] w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={video}
        muted
        playsInline
        className={cn('size-full object-cover', facing === 'user' && '-scale-x-100')}
      />

      {/* Guia para encuadrar: cuatro esquinas y la indicacion */}
      <div aria-hidden className="pointer-events-none absolute inset-x-6 top-16 bottom-28">
        <span className="absolute top-0 left-0 size-10 rounded-tl-xl border-t-2 border-l-2 border-white" />
        <span className="absolute top-0 right-0 size-10 rounded-tr-xl border-t-2 border-r-2 border-white" />
        <span className="absolute bottom-0 left-0 size-10 rounded-bl-xl border-b-2 border-l-2 border-white" />
        <span className="absolute right-0 bottom-0 size-10 rounded-br-xl border-r-2 border-b-2 border-white" />
        <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-sm font-medium text-balance text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.7)]">
          {ready ? 'Fotografia la parte delantera de la prenda' : 'Abriendo la camara'}
        </p>
      </div>

      <button type="button" aria-label="Cerrar camara" onClick={onClose} className={cn(controlClass, 'absolute top-3 right-3 size-9 rounded-full')}>
        <X className="size-4" />
      </button>

      <div className="absolute inset-x-0 bottom-4 grid grid-cols-3 items-center px-5">
        <button type="button" aria-label="Elegir de la galeria" onClick={onPickFromGallery} className={cn(controlClass, 'justify-self-start')}>
          <ImagePlus className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Tomar foto"
          onClick={shoot}
          disabled={!ready}
          className="flex size-18 items-center justify-center justify-self-center rounded-full border-4 border-white/70 outline-none focus-visible:ring-3 focus-visible:ring-white/70 disabled:opacity-50 motion-safe:active:scale-95"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-white text-black">
            <Camera className="size-6" />
          </span>
        </button>
        {canFlip && (
          <button
            type="button"
            aria-label="Cambiar de camara"
            onClick={() => setFacing((current) => (current === 'environment' ? 'user' : 'environment'))}
            className={cn(controlClass, 'justify-self-end')}
          >
            <SwitchCamera className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}
