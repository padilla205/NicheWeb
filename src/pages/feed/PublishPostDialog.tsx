import { type FormEvent, useState } from 'react'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePost } from '@/hooks/usePosts'
import type { Season } from '@/lib/clothing'
import { PhotoPicker } from '@/pages/closet/PhotoPicker'
import { SeasonPicker } from '@/pages/closet/SeasonPicker'

type PublishPostDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
}

export function PublishPostDialog({ origin, onClose }: PublishPostDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title="Publicar"
      description="Sube fotos de tu outfit. Apareceran en el feed y en tu perfil."
    >
      <PublishPostForm onDone={onClose} />
    </MorphDialog>
  )
}

function PublishPostForm({ onDone }: { onDone: () => void }) {
  const [photos, setPhotos] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [seasons, setSeasons] = useState<Season[]>([])
  const createPost = useCreatePost()

  // La ventana se cierra hasta que las fotos se subieron y la publicacion quedo guardada
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0 || createPost.isPending) return
    createPost.mutate({ photos, caption, seasons }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Siempre queda el boton "Agregar" para sumar mas fotos, hasta el maximo */}
      <PhotoPicker files={photos} onChange={setPhotos} label="Sube fotos de tu outfit" />

      <div className="flex flex-col gap-2">
        <Label htmlFor="post-caption">
          Descripcion <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="post-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Cuenta algo de tu outfit"
          maxLength={300}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Temporada <span className="font-normal text-muted-foreground">(opcional, hasta 2)</span>
        </Label>
        <SeasonPicker value={seasons} onChange={setSeasons} />
      </div>

      {createPost.isError && (
        <p role="alert" className="text-sm text-destructive">
          No se pudo publicar. Intenta de nuevo.
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={photos.length === 0 || createPost.isPending}>
          {createPost.isPending ? 'Publicando' : 'Publicar'}
        </Button>
      </DialogFooter>
    </form>
  )
}
