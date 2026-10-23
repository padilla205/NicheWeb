import { ImagePlus } from 'lucide-react'
import { type ReactNode, useRef } from 'react'
import { cn } from '@/lib/utils'

type ImageInputProps = {
  onPick: (file: File) => void
  className: string
  // La foto actual; si no hay, se ve el icono de agregar
  children: ReactNode
}

// Area que abre el selector de archivos y devuelve la foto elegida
export function ImageInput({ onPick, className, children }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex items-center justify-center overflow-hidden border border-dashed bg-muted text-muted-foreground transition-colors duration-150 outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50',
          className,
        )}
      >
        {children ?? <ImagePlus className="size-6" />}
        <span className="sr-only">Elegir foto</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file?.type.startsWith('image/')) onPick(file)
          event.target.value = ''
        }}
      />
    </>
  )
}
