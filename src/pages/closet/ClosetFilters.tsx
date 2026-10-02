import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ExpandableSearch } from '@/components/ExpandableSearch'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { type ClothingType, clothingZones } from '@/lib/clothing'
import { normalizeText } from '@/lib/text'

type ClosetFiltersProps = {
  selected: ClothingType[]
  onChange: (selected: ClothingType[]) => void
}

export function ClosetFilters({ selected, onChange }: ClosetFiltersProps) {
  const [query, setQuery] = useState('')
  const search = normalizeText(query)

  function toggle(type: ClothingType, checked: boolean) {
    onChange(checked ? [...selected, type] : selected.filter((t) => t !== type))
  }

  return (
    // Al cerrar el menu se borra la busqueda
    <Popover onOpenChange={(open) => !open && setQuery('')}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal />
          Filtros
          {selected.length > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      {/* Apertura rapida: crece desde el boton en 200 ms y se cierra en 150 ms */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[30rem] gap-3 p-4 ease-out data-closed:duration-150 data-open:duration-200 data-open:zoom-in-90 data-[side=bottom]:slide-in-from-top-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Tipo de prenda</h2>
          <div className="flex items-center gap-1">
            <ExpandableSearch
              value={query}
              onChange={setQuery}
              placeholder="Buscar prenda..."
              label="Buscar prenda"
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={selected.length === 0}
              onClick={() => onChange([])}
            >
              Limpiar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border">
          {clothingZones.map(({ zone, label, types }) => {
            const visibleTypes = types.filter((type) =>
              normalizeText(type.label).includes(search),
            )
            return (
              <div
                key={zone}
                role="group"
                aria-labelledby={`zona-${zone}`}
                className="flex flex-col bg-popover p-3"
              >
                <h3
                  id={`zona-${zone}`}
                  className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {label}
                </h3>
                {/* Si una zona tiene muchas prendas, su lista se desplaza hacia abajo */}
                <div className="flex max-h-36 flex-col gap-2.5 overflow-y-auto p-0.5 pr-1">
                  {visibleTypes.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin resultados</p>
                  )}
                  {visibleTypes.map((type) => (
                    <label key={type.value} className="flex cursor-pointer items-center gap-2">
                      <Checkbox
                        checked={selected.includes(type.value)}
                        onCheckedChange={(checked) => toggle(type.value, checked === true)}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
