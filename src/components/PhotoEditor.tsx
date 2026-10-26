import { Eraser, RotateCw, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { ChoicePill } from '@/components/ChoicePill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cropImage } from '@/lib/cropImage'
import { removeBackground } from '@/lib/removeBackground'
import { cn } from '@/lib/utils'

type PhotoEditorProps = {
  // Foto a editar; null si la ventana esta cerrada
  file: File | null
  onClose: () => void
  onSave: (file: File) => void
}

// Recortar y enderezar una foto antes de subirla. Es opcional: se abre desde cada foto del selector
export function PhotoEditor({ file, onClose, onSave }: PhotoEditorProps) {
  return (
    <Dialog open={file !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar foto</DialogTitle>
          <DialogDescription>Quita el fondo, recorta o endereza. Todo es opcional.</DialogDescription>
        </DialogHeader>
        {/* key: cada foto empieza sin cambios */}
        {file && <EditorBody key={file.name + file.size} file={file} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  )
}

// Que poner detras de una foto sin fondo
type Backdrop = 'transparente' | 'blanco' | 'negro'
const backdrops: { value: Backdrop; label: string; color?: string }[] = [
  { value: 'transparente', label: 'Transparente' },
  { value: 'blanco', label: 'Blanco', color: '#ffffff' },
  { value: 'negro', label: 'Negro', color: '#000000' },
]

type Shape = 'original' | 'cuadrada' | 'vertical'
const shapes: { value: Shape; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: 'cuadrada', label: 'Cuadrada' },
  { value: 'vertical', label: 'Vertical' },
]

function EditorBody({ file, onClose, onSave }: { file: File; onClose: () => void; onSave: (file: File) => void }) {
  // La misma foto sin fondo, si se quito; se puede regresar a la original
  const [cutout, setCutout] = useState<File | null>(null)
  // null: sin quitar fondo; numero: avance de la descarga del modelo; 'procesando': ya trabajando
  const [removing, setRemoving] = useState<number | 'procesando' | null>(null)
  const source = cutout ?? file
  const [backdrop, setBackdrop] = useState<Backdrop>('transparente')
  const backdropColor = cutout ? backdrops.find((option) => option.value === backdrop)?.color : undefined

  // Direccion temporal para ver la foto; se crea y se libera en el mismo efecto (asi sobrevive al
  // doble montaje de React en desarrollo)
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const objectUrl = URL.createObjectURL(source)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [source])

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  // Giros de 90 (boton) mas el ajuste fino para enderezar (deslizador)
  const [quarterTurns, setQuarterTurns] = useState(0)
  const [straighten, setStraighten] = useState(0)
  const [shape, setShape] = useState<Shape>('original')
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const rotation = quarterTurns * 90 + straighten
  // Al girar de lado, la forma original se voltea (una foto vertical queda horizontal)
  const sideways = quarterTurns % 2 === 1
  const aspect = shape === 'cuadrada' ? 1 : shape === 'vertical' ? 4 / 5 : sideways ? 1 / naturalAspect : naturalAspect

  async function quitarFondo() {
    setError('')
    setRemoving(0)
    try {
      const result = await removeBackground(file, (percent) => setRemoving(percent < 100 ? percent : 'procesando'))
      setCutout(result)
    } catch {
      setError('No se pudo quitar el fondo. Revisa tu conexion e intenta de nuevo.')
    } finally {
      setRemoving(null)
    }
  }

  async function save() {
    if (!area) return
    setSaving(true)
    setError('')
    try {
      onSave(await cropImage(source, area, rotation, backdropColor))
    } catch {
      setError('No se pudo editar la foto. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <>
      {/* Sin fondo se ve sobre cuadritos, como en los editores de fotos, para notar lo transparente */}
      <div
        className={cn('relative h-72 overflow-hidden rounded-lg sm:h-80', cutout && !backdropColor ? 'transparency-grid' : 'bg-black')}
        // La vista previa muestra el fondo elegido
        style={backdropColor ? { backgroundColor: backdropColor } : undefined}
      >
        {url && (
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
            onMediaLoaded={({ naturalWidth, naturalHeight }) => setNaturalAspect(naturalWidth / naturalHeight)}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {cutout ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCutout(null)
              setBackdrop('transparente')
            }}
          >
            <Undo2 />
            Regresar el fondo
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled={removing !== null || saving} onClick={quitarFondo}>
            <Eraser />
            {removing === null
              ? 'Quitar fondo'
              : removing === 'procesando'
                ? 'Quitando fondo...'
                : `Descargando ${removing}%`}
          </Button>
        )}
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {cutout
            ? 'Elige el fondo; si no te gusta, regresa el original.'
            : removing === null
              ? 'La primera vez descarga 44 MB; mejor con wifi.'
              : 'Puede tardar unos segundos.'}
        </span>
      </div>

      {cutout && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Fondo de la foto">
          <span className="text-sm font-medium">Fondo</span>
          {backdrops.map((option) => (
            <ChoicePill
              key={option.value}
              slideId="photo-backdrop"
              active={backdrop === option.value}
              onClick={() => setBackdrop(option.value)}
            >
              {option.label}
            </ChoicePill>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Forma del recorte">
        {shapes.map((option) => (
          <ChoicePill
            key={option.value}
            slideId="photo-shape"
            active={shape === option.value}
            onClick={() => setShape(option.value)}
          >
            {option.label}
          </ChoicePill>
        ))}
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setQuarterTurns((turns) => (turns + 1) % 4)}>
          <RotateCw />
          Girar
        </Button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span className="flex justify-between">
          Enderezar
          <span className="font-normal text-muted-foreground tabular-nums">{straighten}°</span>
        </span>
        <input
          type="range"
          min={-45}
          max={45}
          step={1}
          value={straighten}
          onChange={(event) => setStraighten(Number(event.target.value))}
          onDoubleClick={() => setStraighten(0)}
          className="accent-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Acercar
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="accent-foreground"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        {/* Salir sin cambios: la foto se sube tal cual */}
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
          Dejar tal cual
        </Button>
        <Button type="button" onClick={save} disabled={!area || saving || removing !== null}>
          {saving ? 'Guardando' : 'Listo'}
        </Button>
      </div>
    </>
  )
}
