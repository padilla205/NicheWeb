import { useState, type FormEvent } from 'react'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddItem } from '@/hooks/useItems'
import type { ClothingType, Season } from '@/lib/clothing'
import { ClothingTypePicker } from './ClothingTypePicker'
import { ColorPicker } from './ColorPicker'
import { PhotoPicker } from './PhotoPicker'
import { SeasonPicker } from './SeasonPicker'
import { TeamPicker } from './TeamPicker'

type AddItemDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
}

export function AddItemDialog({ origin, onClose }: AddItemDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title="Agregar prenda"
      description="Sube hasta 5 fotos y elige el tipo de prenda."
    >
      <AddItemForm onDone={onClose} />
    </MorphDialog>
  )
}

function AddItemForm({ onDone }: { onDone: () => void }) {
  const [photos, setPhotos] = useState<File[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<ClothingType | ''>('')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [team, setTeam] = useState('')
  const addItem = useAddItem()

  const canSave = photos.length > 0 && type !== ''
  const isJersey = type === 'jerseys-futbol'

  // Si cambia a otro tipo de prenda, se borra el equipo elegido
  function changeType(newType: ClothingType) {
    setType(newType)
    if (newType !== 'jerseys-futbol') setTeam('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0 || type === '') return
    addItem({
      photos,
      name,
      type,
      seasons: selectedSeasons,
      colors,
      team: isJersey && team ? team : undefined,
    })
    onDone()
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
        <span className="text-sm font-medium">Temporada</span>
        <SeasonPicker value={selectedSeasons} onChange={setSelectedSeasons} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Colores <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <ColorPicker value={colors} onChange={setColors} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave}>
          Guardar prenda
        </Button>
      </DialogFooter>
    </form>
  )
}
