import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddItem, useUpdateItem } from '@/hooks/useItems'
import { useListingBrands } from '@/hooks/useListings'
import { useProfile } from '@/hooks/useProfile'
import { clearItemDraft, type ItemDraft, loadItemDraft, saveItemDraft } from '@/lib/itemDraft'
import { type ClosetItem, type ClothingType, itemDecades, type Season } from '@/lib/clothing'
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
      description={item ? 'Cambia lo que necesites de tu prenda.' : 'Toma o sube hasta 5 fotos y llena los datos.'}
    >
      {item ? <AddItemForm onDone={onClose} item={item} /> : <NewItemForm onDone={onClose} />}
    </MorphDialog>
  )
}

// Prenda nueva: primero busca si quedo un borrador, para que la camara no se abra encima de el
function NewItemForm({ onDone }: { onDone: () => void }) {
  const { id: userId } = useProfile()
  const [draft, setDraft] = useState<ItemDraft | null | undefined>(undefined)
  useEffect(() => {
    loadItemDraft(userId).then(setDraft)
  }, [userId])
  if (draft === undefined) return <div aria-hidden className="h-56 animate-pulse rounded-lg bg-muted" />
  return <AddItemForm onDone={onDone} draft={draft ?? undefined} draftOwner={userId} />
}

type AddItemFormProps = {
  onDone: () => void
  item?: ClosetItem
  // Lo recuperado de la vez pasada
  draft?: ItemDraft
  // Con esto, lo que escribas se va guardando como borrador (solo en prendas nuevas)
  draftOwner?: string
}

function AddItemForm({ onDone, item, draft, draftOwner }: AddItemFormProps) {
  const [photos, setPhotos] = useState<File[]>(draft?.photos ?? [])
  const [name, setName] = useState(item?.name ?? draft?.name ?? '')
  const [type, setType] = useState<ClothingType | ''>(item?.type ?? draft?.type ?? '')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(item?.seasons ?? draft?.seasons ?? [])
  const [colors, setColors] = useState<string[]>(item?.colors ?? draft?.colors ?? [])
  const [team, setTeam] = useState(item?.team ?? draft?.team ?? '')
  const [brand, setBrand] = useState(item?.brand ?? draft?.brand ?? '')
  const [decade, setDecade] = useState<number | undefined>(item?.decade ?? draft?.decade)
  const [recovered, setRecovered] = useState(!!draft)
  // Al guardar o cancelar ya no se debe escribir el borrador
  const finished = useRef(false)
  const brands = useListingBrands()
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

  // Guarda el borrador poco despues de cada cambio. Asi ya esta a salvo cuando empieza algo pesado como
  // quitar el fondo. Si el formulario queda vacio, no hay nada que recuperar
  useEffect(() => {
    if (!draftOwner || finished.current) return
    const empty = photos.length === 0 && !name && !type && !brand && !decade && !team && selectedSeasons.length === 0 && colors.length === 0
    const timer = window.setTimeout(() => {
      if (finished.current) return
      if (empty) clearItemDraft(draftOwner)
      else saveItemDraft(draftOwner, { photos, name, type, seasons: selectedSeasons, colors, team, brand, decade })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [draftOwner, photos, name, type, selectedSeasons, colors, team, brand, decade])

  function resetForm() {
    setPhotos([])
    setName('')
    setType('')
    setSelectedSeasons([])
    setColors([])
    setTeam('')
    setBrand('')
    setDecade(undefined)
    setRecovered(false)
  }

  // Cancelar a proposito tira el borrador; cerrar con la X o tocando afuera lo conserva
  function discardAndClose() {
    finished.current = true
    if (draftOwner) clearItemDraft(draftOwner)
    onDone()
  }

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
      brand,
      decade,
    }
    try {
      if (item) await updateItem.mutateAsync({ item, changes })
      else await addItem.mutateAsync(changes)
      finished.current = true
      if (draftOwner) await clearItemDraft(draftOwner)
      onDone()
    } catch {
      setSaveError('No se pudo guardar la prenda. Revisa tu conexion e intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {recovered && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
          <span className="text-pretty">Recuperamos tu prenda sin guardar.</span>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            Descartar
          </Button>
        </div>
      )}
      {/* En celular, al agregar una prenda nueva, la camara ya esta abierta */}
      <PhotoPicker files={photos} onChange={setPhotos} camera autoOpenCamera={!item} />

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
        <Label htmlFor="item-brand">
          Marca <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        {/* Sugiere las marcas que ya existen para que "Nike" no aparezca escrito de mil formas */}
        <Input
          id="item-brand"
          list="item-brands"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
          placeholder="Ej. Nike, Zara"
          maxLength={60}
        />
        <datalist id="item-brands">
          {brands.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Decada <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Decada de la prenda">
          {itemDecades.map((option) => (
            // Tocar la elegida la quita
            <ChoicePill key={option} active={decade === option} onClick={() => setDecade(decade === option ? undefined : option)}>
              {option}
            </ChoicePill>
          ))}
        </div>
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
        <Button type="button" variant="outline" onClick={discardAndClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave || saving}>
          {saving ? 'Guardando' : item ? 'Guardar cambios' : 'Guardar prenda'}
        </Button>
      </DialogFooter>
    </form>
  )
}
