import { Check, ImagePlus, SwitchCamera, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { cn } from '@/lib/utils'

export type CameraStep = { label: string; hint: string; close?: boolean }

// Fotos que se piden al agregar una prenda, en orden; la primera sera la portada
export const garmentSteps: CameraStep[] = [
  { label: 'Frente', hint: 'Toma la parte de adelante de la prenda' },
  { label: 'Atras', hint: 'Ahora voltea la prenda y toma la parte de atras' },
  // close: la guia se hace chica porque la etiqueta se fotografia de cerca
  { label: 'Etiqueta', hint: 'Acerca la camara a la etiqueta', close: true },
]

type CameraCaptureProps = {
  steps: CameraStep[]
  // Fotos tomadas, en el orden de los pasos (las que se omitieron no van)
  onDone: (files: File[]) => void
  // Si la camara no se puede abrir, para elegir fotos de la galeria en su lugar
  onPickFromGallery: () => void
  onClose: () => void
}

// Camara a pantalla completa que guia paso a paso. Cada paso se puede omitir, repetir tocando su
// miniatura o llenar desde la galeria. La camara se apaga al salir
export function CameraCapture({ steps, onDone, onPickFromGallery, onClose }: CameraCaptureProps) {
  const video = useRef<HTMLVideoElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [canFlip, setCanFlip] = useState(false)
  const [shots, setShots] = useState<(File | null)[]>(() => steps.map(() => null))
  const [current, setCurrent] = useState(0)
  const [flash, setFlash] = useState(0)
  const taken = shots.filter((shot): shot is File => shot !== null)

  // Escape sale de la camara sin cerrar el formulario de abajo
  useModalBehavior(() => (taken.length > 0 ? onDone(taken) : onClose()))

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
        // Si se salio mientras pedia permiso, la camara no se queda prendida
        if (cancelled) return opened.getTracks().forEach((track) => track.stop())
        stream = opened
        if (video.current) {
          video.current.srcObject = opened
          await video.current.play()
        }
        setReady(true)
        // Cuantas camaras hay solo se sabe despues de dar permiso
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

  // Guarda la foto del paso actual y pasa al siguiente que falte; si ya no falta ninguno, termina
  function save(file: File) {
    const next = shots.map((shot, i) => (i === current ? file : shot))
    setShots(next)
    const pending = next.findIndex((shot, i) => shot === null && i > current)
    if (pending !== -1) setCurrent(pending)
    else onDone(next.filter((shot): shot is File => shot !== null))
  }

  function skip() {
    const pending = shots.findIndex((shot, i) => shot === null && i > current)
    if (pending !== -1) setCurrent(pending)
    else if (taken.length > 0) onDone(taken)
    else onClose()
  }

  function shoot() {
    const element = video.current
    if (!element || !ready) return
    setFlash((count) => count + 1)
    const canvas = document.createElement('canvas')
    canvas.width = element.videoWidth
    canvas.height = element.videoHeight
    canvas.getContext('2d')?.drawImage(element, 0, 0)
    canvas.toBlob(
      (blob) => blob && save(new File([blob], `${steps[current].label.toLowerCase()}-${Date.now()}.jpg`, { type: 'image/jpeg' })),
      'image/jpeg',
      0.92,
    )
  }

  const step = steps[current]
  const roundClass =
    'flex size-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md outline-none focus-visible:ring-3 focus-visible:ring-white/70 motion-safe:active:scale-95'

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Camara" className="fixed inset-0 z-[60] flex flex-col bg-black text-white">
      {failed ? (
        <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-pretty">No se pudo abrir la camara. Revisa el permiso en tu navegador o sube tus fotos.</p>
          <div className="dark flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="button" onClick={onPickFromGallery}>
              <ImagePlus />
              Subir fotos
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={video}
            muted
            playsInline
            className={cn('absolute inset-0 size-full object-cover', facing === 'user' && '-scale-x-100')}
          />
          {/* Destello al tomar la foto */}
          <div key={flash} aria-hidden className={cn('pointer-events-none absolute inset-0 bg-white opacity-0', flash > 0 && 'camera-flash')} />

          {/* Arriba: salir, en que paso va y terminar */}
          <div className="relative flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-8">
            <button type="button" aria-label="Salir de la camara" onClick={onClose} className={roundClass}>
              <X className="size-5" />
            </button>
            <p className="text-sm font-medium tabular-nums">
              Paso {current + 1} de {steps.length}
            </p>
            <button type="button" onClick={skip} className="h-12 rounded-full px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-white/70">
              {current === steps.length - 1 && taken.length > 0 ? 'Terminar' : 'Omitir'}
            </button>
          </div>

          {/* En medio: esquinas para encuadrar y la indicacion */}
          <div className="relative flex flex-1 items-center justify-center px-6">
            <div aria-hidden className={cn('pointer-events-none absolute transition-all duration-300', step.close ? 'aspect-square w-1/2 max-w-64' : 'inset-x-6 inset-y-2')}>
              <span className="absolute top-0 left-0 size-12 rounded-tl-2xl border-t-[3px] border-l-[3px] border-white" />
              <span className="absolute top-0 right-0 size-12 rounded-tr-2xl border-t-[3px] border-r-[3px] border-white" />
              <span className="absolute bottom-0 left-0 size-12 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white" />
              <span className="absolute right-0 bottom-0 size-12 rounded-br-2xl border-r-[3px] border-b-[3px] border-white" />
            </div>
            <div aria-live="polite" className={cn('relative max-w-xs text-center [text-shadow:0_1px_8px_rgb(0_0_0/0.8)]', step.close && 'absolute top-4')}>
              <p className="text-3xl font-bold tracking-tight">{step.label}</p>
              <p className="mt-1 text-pretty">{ready ? step.hint : 'Abriendo la camara'}</p>
            </div>
          </div>

          {/* Abajo: miniaturas de los pasos, galeria, disparo y cambiar de camara */}
          <div className="relative flex flex-col gap-5 bg-gradient-to-t from-black/70 to-transparent px-6 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <StepThumbs steps={steps} shots={shots} current={current} onSelect={setCurrent} />
            <div className="grid grid-cols-3 items-center">
              <button type="button" aria-label="Elegir de la galeria" onClick={() => galleryInput.current?.click()} className={cn(roundClass, 'justify-self-start')}>
                <ImagePlus className="size-5" />
              </button>
              <button
                type="button"
                aria-label={`Tomar foto: ${step.label}`}
                onClick={shoot}
                disabled={!ready}
                className="flex size-20 items-center justify-center justify-self-center rounded-full border-4 border-white outline-none focus-visible:ring-3 focus-visible:ring-white/70 disabled:opacity-50 motion-safe:active:scale-95"
              >
                <span className="size-16 rounded-full bg-white" />
              </button>
              {canFlip && (
                <button
                  type="button"
                  aria-label="Cambiar de camara"
                  onClick={() => setFacing((value) => (value === 'environment' ? 'user' : 'environment'))}
                  className={cn(roundClass, 'justify-self-end')}
                >
                  <SwitchCamera className="size-5" />
                </button>
              )}
            </div>
          </div>
          <input
            ref={galleryInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) save(file)
            }}
          />
        </>
      )}
    </div>,
    document.body,
  )
}

type StepThumbsProps = {
  steps: CameraStep[]
  shots: (File | null)[]
  current: number
  onSelect: (index: number) => void
}

// Una miniatura por paso: la foto ya tomada, o vacia. Tocar una regresa a ese paso para repetirla
function StepThumbs({ steps, shots, current, onSelect }: StepThumbsProps) {
  const urls = useMemo(() => shots.map((shot) => (shot ? URL.createObjectURL(shot) : null)), [shots])
  useEffect(() => () => urls.forEach((url) => url && URL.revokeObjectURL(url)), [urls])
  if (steps.length < 2) return null
  return (
    <div className="flex justify-center gap-3">
      {steps.map((step, i) => (
        <button
          key={step.label}
          type="button"
          onClick={() => onSelect(i)}
          aria-current={i === current ? 'step' : undefined}
          aria-label={shots[i] ? `Repetir foto: ${step.label}` : `Ir a: ${step.label}`}
          className="flex flex-col items-center gap-1 text-xs font-medium outline-none focus-visible:underline"
        >
          <span
            className={cn(
              'relative flex size-14 items-center justify-center overflow-hidden rounded-xl border-2 bg-white/10',
              i === current ? 'border-white' : 'border-white/30',
            )}
          >
            {urls[i] && <img src={urls[i]} alt="" className="size-full object-cover" />}
            {shots[i] && (
              <span className="absolute right-0.5 bottom-0.5 flex size-4 items-center justify-center rounded-full bg-white text-black">
                <Check className="size-3" />
              </span>
            )}
          </span>
          {step.label}
        </button>
      ))}
    </div>
  )
}
