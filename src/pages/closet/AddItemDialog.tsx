import { useEffect, useState, type FormEvent } from 'react'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddItem, useUpdateItem } from '@/hooks/useItems'
import type { ClosetItem, ClothingType, Season } from '@/lib/clothing'
import { fileFromPhoto } from '@/lib/photos'
import { ClothingTypePicker } from './ClothingTypePicker'
import { ColorPicker } from './ColorPicker'
import { PhotoPicker } from './PhotoPicker'
import { MAX_SEASONS, SeasonPicker } from './SeasonPicker'
import { TeamPicker } from './TeamPicker'

type AddItemDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
  // Con una prenda, la ventana sirve para editarla en lugar de agregar una nueva
  item?: ClosetItem
}

export function AddItemDialog({ origin, onClose, item }: AddItemDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title={item ? 'Editar prenda' : 'Agregar prenda'}
      description={item ? 'Cambia lo que necesites de tu prenda.' : 'Sube hasta 5 fotos y elige el tipo de prenda.'}
    >
      <AddItemForm onDone={onClose} item={item} />
    </MorphDialog>
  )
}

function AddItemForm({ onDone, item }: { onDone: () => void; item?: ClosetItem }) {
  const [photos, setPhotos] = useState<File[]>([])
  const [name, setName] = useState(item?.name ?? '')
  const [type, setType] = useState<ClothingType | ''>(item?.type ?? '')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(item?.seasons ?? [])
  const [colors, setColors] = useState<string[]>(item?.colors ?? [])
  const [team, setTeam] = useState(item?.team ?? '')
  const addItem = useAddItem()
  const updateItem = useUpdateItem()
  const saving = addItem.isPending || updateItem.isPending
  const [saveError, setSaveError] = useState('')

  // Al editar, carga sus fotos en el selector. Al guardar no se vuelven a subir: se conservan tal cual.
  // Depende de las rutas (texto) y no de la prenda, para no borrar tus cambios si la lista se recarga
  const photoKey = item?.photoPaths.join('|') ?? ''
  useEffect(() => {
    if (photoKey) Promise.all(photoKey.split('|').map(fileFromPhoto)).then(setPhotos)
  }, [photoKey])

  const canSave = photos.length > 0 && type !== ''
  const isJersey = type === 'jerseys-futbol'

  // Si cambia a otro tipo de prenda, se borra el equipo elegido
  function changeType(newType: ClothingType) {
    setType(newType)
    if (newType !== 'jerseys-futbol') setTeam('')
  }

  // Espera a que las fotos se suban para cerrar; si falla, la ventana sigue abierta con todo lo elegido
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0 || type === '') return
    setSaveError('')
    const changes = {
      photos,
      name,
      type,
      seasons: selectedSeasons,
      colors,
      team: isJersey && team ? team : undefined,
    }
    try {
      if (item) await updateItem.mutateAsync({ item, changes })
      else await addItem.mutateAsync(changes)
      onDone()
    } catch {
      setSaveError('No se pudo guardar la prenda. Revisa tu conexion e intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PhotoPicker files={photos} onChange={setPhotos} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-type">Tipo de prenda</Label>
        <ClothingTypePicker id="item-type" value={type} onChange={changeType} />
      </div>

      {isJersey && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-team">
            Equipo <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <TeamPicker id="item-team" value={team} onChange={setTeam} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-name">
          Nombre <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Jeans azules"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Temporada <span className="font-normal text-muted-foreground">(maximo {MAX_SEASONS})</span>
        </span>
        <SeasonPicker value={selectedSeasons} onChange={setSelectedSeasons} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Colores <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <ColorPicker value={colors} onChange={setColors} />
      </div>

      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave || saving}>
          {saving ? 'Guardando' : item ? 'Guardar cambios' : 'Guardar prenda'}
        </Button>
      </DialogFooter>
    </form>
  )
}
