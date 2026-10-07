import { type FormEvent, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { LocationFields } from '@/components/LocationFields'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateListing } from '@/hooks/useListings'
import { useUserLocation } from '@/hooks/useUserLocation'
import type { ClothingType, Season } from '@/lib/clothing'
import { toLocation } from '@/lib/locations'
import { type ListingCondition, listingConditions } from '@/lib/marketplace'
import { ClothingTypePicker } from '@/pages/closet/ClothingTypePicker'
import { ColorPicker } from '@/pages/closet/ColorPicker'
import { PhotoPicker } from '@/pages/closet/PhotoPicker'
import { SeasonPicker } from '@/pages/closet/SeasonPicker'
import { TeamPicker } from '@/pages/closet/TeamPicker'

type CreateListingDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
}

export function CreateListingDialog({ origin, onClose }: CreateListingDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title="Crear venta"
      description="Agrega fotos y los datos de la prenda. El trato se cierra en persona."
    >
      <CreateListingForm onDone={onClose} />
    </MorphDialog>
  )
}

function CreateListingForm({ onDone }: { onDone: () => void }) {
  const [photos, setPhotos] = useState<File[]>([])
  const [title, setTitle] = useState('')
  // Se guarda como texto mientras se escribe; se convierte a numero al publicar
  const [price, setPrice] = useState('')
  const [type, setType] = useState<ClothingType | ''>('')
  const [team, setTeam] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState<ListingCondition | ''>('')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [description, setDescription] = useState('')
  // Empieza con tu localizacion si ya la elegiste; se puede cambiar solo para esta venta
  const userLocation = useUserLocation()
  const [place, setPlace] = useState(userLocation ?? { country: '', city: '' })
  const location = toLocation(place.country, place.city)
  const createListing = useCreateListing()

  const priceNumber = Number(price)
  const isJersey = type === 'jerseys-futbol'
  const canPublish =
    photos.length > 0 &&
    title.trim() !== '' &&
    Number.isInteger(priceNumber) &&
    priceNumber > 0 &&
    type !== '' &&
    size.trim() !== '' &&
    condition !== '' &&
    location !== null

  // Si cambia a otro tipo de prenda, se borra el equipo elegido
  function changeType(newType: ClothingType) {
    setType(newType)
    if (newType !== 'jerseys-futbol') setTeam('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canPublish) return
    createListing({
      photos,
      title,
      price: priceNumber,
      size,
      location,
      condition,
      type,
      seasons: selectedSeasons,
      colors,
      team: isJersey && team ? team : undefined,
      description,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PhotoPicker files={photos} onChange={setPhotos} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="listing-title">Titulo</Label>
        <Input
          id="listing-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. Chamarra de mezclilla"
          maxLength={60}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-price">Precio (MXN)</Label>
          <Input
            id="listing-price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Ej. 350"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-size">Talla</Label>
          <Input
            id="listing-size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            placeholder="Ej. M, 30, 27.5"
            maxLength={15}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="listing-type">Tipo de prenda</Label>
        <ClothingTypePicker id="listing-type" value={type} onChange={changeType} />
      </div>

      {isJersey && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-team">
            Equipo <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <TeamPicker id="listing-team" value={team} onChange={setTeam} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Donde se entrega</span>
        <LocationFields idPrefix="listing-location" country={place.country} city={place.city} onChange={setPlace} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Estado</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Estado">
          {listingConditions.map((option) => (
            <ChoicePill
              key={option.value}
              active={condition === option.value}
              onClick={() => setCondition(option.value)}
            >
              {option.label}
            </ChoicePill>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Temporada <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <SeasonPicker value={selectedSeasons} onChange={setSelectedSeasons} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Colores <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <ColorPicker value={colors} onChange={setColors} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="listing-description">
          Descripcion <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="listing-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Detalles, medidas, defectos, donde se entrega..."
          maxLength={500}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canPublish}>
          Publicar venta
        </Button>
      </DialogFooter>
    </form>
  )
}
