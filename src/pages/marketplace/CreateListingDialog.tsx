import { type FormEvent, useEffect, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { LocationFields } from '@/components/LocationFields'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateListing, useListingBrands, useUpdateListing } from '@/hooks/useListings'
import { useUserLocation } from '@/hooks/useUserLocation'
import { type ClosetItem, getTypeInfo, type Season } from '@/lib/clothing'
import { toLocation } from '@/lib/locations'
import { fileFromPhoto } from '@/lib/photos'
import { type Delivery, isJerseyType, type Listing, type ListingCondition, listingConditions } from '@/lib/marketplace'
import { ColorPicker } from '@/pages/closet/ColorPicker'
import { PhotoPicker } from '@/pages/closet/PhotoPicker'
import { MAX_SEASONS, SeasonPicker } from '@/pages/closet/SeasonPicker'
import { TeamPicker } from '@/pages/closet/TeamPicker'
import { DeliveryPicker } from './DeliveryPicker'

type CreateListingDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
  // Si llega una venta, la ventana sirve para editarla en lugar de crear una nueva
  listing?: Listing
  // Prenda del closet que se quiere vender: llena fotos, nombre, tipo, temporadas y colores
  fromItem?: ClosetItem
  // Se llama despues de publicar una venta nueva (no al cancelar)
  onPublished?: () => void
}

export function CreateListingDialog({ origin, onClose, listing, fromItem, onPublished }: CreateListingDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title={listing ? 'Editar venta' : 'Crear venta'}
      description={
        listing ? 'Cambia lo que necesites de tu venta.' : 'Agrega fotos y los datos de la prenda. El trato se cierra en persona.'
      }
    >
      <CreateListingForm
        onDone={onClose}
        listing={listing}
        fromItem={fromItem}
        onPublished={onPublished}
      />
    </MorphDialog>
  )
}

type CreateListingFormProps = Pick<CreateListingDialogProps, 'listing' | 'fromItem' | 'onPublished'> & {
  onDone: () => void
}

function CreateListingForm({ onDone, listing, fromItem, onPublished }: CreateListingFormProps) {
  const itemType = fromItem ? getTypeInfo(fromItem.type).label : ''
  const [photos, setPhotos] = useState<File[]>([])
  const [title, setTitle] = useState(listing?.title ?? (fromItem ? fromItem.name || itemType : ''))
  // Se guarda como texto mientras se escribe; se convierte a numero al publicar
  const [price, setPrice] = useState(listing ? String(listing.price) : '')
  const [type, setType] = useState(listing?.type ?? itemType)
  const [brand, setBrand] = useState(listing?.brand ?? '')
  const brands = useListingBrands()
  const [team, setTeam] = useState(listing?.team ?? fromItem?.team ?? '')
  const [size, setSize] = useState(listing?.size ?? '')
  const [condition, setCondition] = useState<ListingCondition | ''>(listing?.condition ?? '')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(listing?.seasons ?? fromItem?.seasons ?? [])
  const [colors, setColors] = useState<string[]>(listing?.colors ?? fromItem?.colors ?? [])
  const [description, setDescription] = useState(listing?.description ?? '')
  const [delivery, setDelivery] = useState<Delivery | undefined>(listing?.delivery)
  // Empieza con tu localizacion si ya la elegiste; se puede cambiar solo para esta venta
  const userLocation = useUserLocation()
  const [place, setPlace] = useState(listing?.location ?? userLocation ?? { country: '', city: '' })
  const location = toLocation(place.country, place.city)
  const createListing = useCreateListing()
  const updateListing = useUpdateListing()
  const saving = createListing.isPending || updateListing.isPending
  const [saveError, setSaveError] = useState('')

  // Al editar (o al vender una prenda del closet), carga sus fotos en el selector.
  // Al guardar no se vuelven a comprimir: se conservan o se copian tal cual
  useEffect(() => {
    const paths = listing?.photoPaths ?? fromItem?.photoPaths ?? []
    if (paths.length > 0) Promise.all(paths.map(fileFromPhoto)).then(setPhotos)
  }, [listing, fromItem])

  const priceNumber = Number(price)
  const isJersey = isJerseyType(type)
  const hasPhotos = photos.length > 0
  const canPublish =
    hasPhotos &&
    title.trim() !== '' &&
    Number.isInteger(priceNumber) &&
    priceNumber > 0 &&
    type.trim() !== '' &&
    size.trim() !== '' &&
    condition !== '' &&
    location !== null

  // Si el tipo deja de ser un jersey, se borra el equipo elegido
  function changeType(newType: string) {
    setType(newType)
    if (!isJerseyType(newType)) setTeam('')
  }

  // Espera a que se guarde para cerrar; si falla, la ventana sigue abierta con todo lo escrito
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canPublish) return
    setSaveError('')
    const data = {
      photos,
      title,
      price: priceNumber,
      size,
      location,
      delivery,
      condition,
      type,
      brand,
      seasons: selectedSeasons,
      colors,
      team: isJersey && team ? team : undefined,
      description,
    }
    try {
      if (listing) await updateListing.mutateAsync({ listing, data })
      else {
        await createListing.mutateAsync(data)
        onPublished?.()
      }
      onDone()
    } catch {
      setSaveError('No se pudo guardar la venta. Revisa tu conexion e intenta de nuevo.')
    }
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-type">Tipo de prenda</Label>
          <Input
            id="listing-type"
            value={type}
            onChange={(event) => changeType(event.target.value)}
            placeholder="Ej. Chamarra, tenis"
            maxLength={40}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="listing-brand">
            Marca <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          {/* Sugiere las marcas que ya existen para que "Nike" no aparezca escrito de mil formas */}
          <Input
            id="listing-brand"
            list="listing-brands"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Ej. Nike, Zara"
            maxLength={40}
          />
          <datalist id="listing-brands">
            {brands.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
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
        <span className="text-sm font-medium">
          Lugar de entrega en el mapa <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <DeliveryPicker value={delivery} onChange={setDelivery} city={location} />
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
          Temporada <span className="font-normal text-muted-foreground">(opcional, maximo {MAX_SEASONS})</span>
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

      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canPublish || saving}>
          {saving ? 'Guardando' : listing ? 'Guardar cambios' : 'Publicar venta'}
        </Button>
      </DialogFooter>
    </form>
  )
}
