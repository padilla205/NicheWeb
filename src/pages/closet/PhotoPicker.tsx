import { ImagePlus, WandSparkles, X } from 'lucide-react'
import { type DragEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { PhotoEditor } from '@/components/PhotoEditor'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MAX_PHOTOS = 5

type PhotoPickerProps = {
  files: File[]
  onChange: (files: File[]) => void
  // Texto del area vacia
  label?: string
}

export function PhotoPicker({ files, onChange, label = 'Sube fotos de la prenda' }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isFull = files.length >= MAX_PHOTOS
  // Foto que se esta recortando o enderezando; null si el editor esta cerrado
  const [editing, setEditing] = useState<number | null>(null)

  // Crea una direccion temporal para ver cada foto y las libera al cambiarlas (evita gastar memoria)
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => previewUrls.forEach((url) => URL.revokeObjectURL(url)), [previewUrls])

  // Agrega solo imagenes y solo hasta completar el maximo
  function add(list: FileList | null) {
    const images = Array.from(list ?? []).filter((file) => file.type.startsWith('image/'))
    if (images.length > 0) onChange([...files, ...images].slice(0, MAX_PHOTOS))
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  // La foto editada reemplaza a la original en el mismo lugar
  function replace(index: number, file: File) {
    onChange(files.map((current, i) => (i === index ? file : current)))
    setEditing(null)
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(event) => {
        add(event.target.files)
        // Permite volver a elegir la misma foto despues de quitarla
        event.target.value = ''
      }}
    />
  )

  if (files.length === 0) {
    return (
      <>
        <AddPhotoArea onPick={() => inputRef.current?.click()} onDropFiles={add} className="h-56">
          <ImagePlus className="size-8" />
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs">
            Arrastralas aqui o haz clic para elegirlas (hasta {MAX_PHOTOS})
          </span>
        </AddPhotoArea>
        {fileInput}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            <img src={url} alt={`Foto ${index + 1}`} className="size-full object-cover" />
            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium">
                Portada
              </span>
            )}
            {/* Editar (quitar fondo, recortar, enderezar) es opcional; los GIF no se editan para que sigan animados */}
            {files[index].type !== 'image/gif' && (
              <Button
                type="button"
                variant="secondary"
                size="xs"
                className="absolute top-1.5 left-1.5"
                onClick={() => setEditing(index)}
                aria-label={`Editar foto ${index + 1}`}
              >
                <WandSparkles />
                Editar
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-xs"
              className="absolute top-1.5 right-1.5"
              onClick={() => remove(index)}
            >
              <X />
              <span className="sr-only">Quitar foto {index + 1}</span>
            </Button>
          </div>
        ))}
        {!isFull && (
          <AddPhotoArea
            onPick={() => inputRef.current?.click()}
            onDropFiles={add}
            className="aspect-square"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs">Agregar</span>
          </AddPhotoArea>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {files.length} de {MAX_PHOTOS} fotos. La primera es la portada. Toca Editar para quitar el fondo o recortar; si no, se suben tal cual.
      </p>
      {fileInput}
      <PhotoEditor
        file={editing === null ? null : files[editing]}
        onClose={() => setEditing(null)}
        onSave={(file) => editing !== null && replace(editing, file)}
      />
    </div>
  )
}

type AddPhotoAreaProps = {
  onPick: () => void
  onDropFiles: (files: FileList) => void
  className?: string
  children: ReactNode
}

// Zona punteada que abre el selector de archivos al hacer clic y acepta fotos arrastradas
function AddPhotoArea({ onPick, onDropFiles, className, children }: AddPhotoAreaProps) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    onDropFiles(event.dataTransfer.files)
  }

  return (
    <button
      type="button"
      onClick={onPick}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors duration-150 outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50',
        dragging && 'border-primary bg-muted',
        className,
      )}
    >
      {children}
    </button>
  )
}
