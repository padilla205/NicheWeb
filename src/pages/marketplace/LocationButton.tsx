import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { LocationFields } from '@/components/LocationFields'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSetUserLocation, useUserLocation } from '@/hooks/useUserLocation'
import { formatLocation, toLocation } from '@/lib/locations'

// Boton para elegir tu pais y ciudad; el marketplace usa esto para mostrar ventas cercanas
export function LocationButton() {
  const location = useUserLocation()
  const setLocation = useSetUserLocation()
  const [open, setOpen] = useState(false)
  // Borrador: lo que se elige no se aplica hasta tocar "Guardar"
  const [draft, setDraft] = useState({ country: '', city: '' })
  const next = toLocation(draft.country, draft.city)

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) setDraft(location ?? { country: '', city: '' })
    setOpen(isOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="max-w-56">
          <MapPin />
          <span className="truncate">{location ? formatLocation(location) : 'Localizacion'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-96 max-w-[calc(100vw-2rem)] gap-4 p-4 ease-out data-closed:duration-150 data-open:duration-200"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">Tu localizacion</h2>
          <p className="text-muted-foreground">Te mostramos primero las ventas de tu ciudad.</p>
        </div>
        <LocationFields idPrefix="user-location" country={draft.country} city={draft.city} onChange={setDraft} />
        <div className="flex justify-end gap-2">
          {location && (
            <Button
              variant="ghost"
              onClick={() => {
                setLocation(null)
                setOpen(false)
              }}
            >
              Quitar
            </Button>
          )}
          <Button
            disabled={!next}
            onClick={() => {
              setLocation(next)
              setOpen(false)
            }}
          >
            Guardar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
