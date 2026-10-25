import { RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { ChoicePill } from '@/components/ChoicePill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cropImage } from '@/lib/cropImage'

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
          <DialogDescription>Arrastra para acomodar, recorta y endereza.</DialogDescription>
        </DialogHeader>
        {/* key: cada foto empieza sin cambios */}
        {file && <EditorBody key={file.name + file.size} file={file} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  )
}

type Shape = 'original' | 'cuadrada' | 'vertical'
const shapes: { value: Shape; label: string }[] = [
  { value: 'original', label: 'Original' },
  { value: 'cuadrada', label: 'Cuadrada' },
  { value: 'vertical', label: 'Vertical' },
]

function EditorBody({ file, onClose, onSave }: { file: File; onClose: () => void; onSave: (file: File) => void }) {
  // Direccion temporal para ver la foto; se crea y se libera en el mismo efecto (asi sobrevive al
  // doble montaje de React en desarrollo)
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

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

  async function save() {
    if (!area) return
    setSaving(true)
    setError('')
    try {
      onSave(await cropImage(file, area, rotation))
    } catch {
      setError('No se pudo editar la foto. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <>
      <div className="relative h-72 overflow-hidden rounded-lg bg-black sm:h-80">
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
        <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="button" onClick={save} disabled={!area || saving}>
          {saving ? 'Guardando' : 'Listo'}
        </Button>
      </div>
    </>
  )
}
