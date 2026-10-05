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
  const visibleZones = clothingZones
    .map(({ zone, label, types }) => ({
      zone,
      label,
      types: types.filter((type) => normalizeText(type.label).includes(search)),
    }))
    .filter(({ types }) => types.length > 0)

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
        className="max-h-[var(--radix-popover-content-available-height)] w-[30rem] max-w-[calc(100vw-2rem)] gap-3 p-4 ease-out data-closed:duration-150 data-open:duration-200 data-open:zoom-in-90 data-[side=bottom]:slide-in-from-top-3"
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
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
        <div className="min-h-0 max-h-80 overflow-y-auto rounded-md border">
          {visibleZones.length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">Sin resultados</p>
          )}
          {visibleZones.map(({ zone, label, types }) => (
            <div
              key={zone}
              role="group"
              aria-labelledby={`zona-${zone}`}
              className="border-b p-2 last:border-b-0"
            >
              <h3
                id={`zona-${zone}`}
                className="px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                {label}
              </h3>
              <ul className="flex flex-col gap-1">
                {types.map((type) => (
                  <li key={type.value}>
                    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent has-[[data-state=checked]]:bg-accent">
                      <Checkbox
                        checked={selected.includes(type.value)}
                        onCheckedChange={(checked) => toggle(type.value, checked === true)}
                      />
                      {type.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
