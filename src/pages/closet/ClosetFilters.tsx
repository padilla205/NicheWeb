import { SlidersHorizontal } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { ExpandableSearch } from '@/components/ExpandableSearch'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  type ClosetFilterValue,
  type ClosetVisibilityFilter,
  clothingColors,
  clothingZones,
  countClosetFilters,
  emptyClosetFilters,
  seasons,
} from '@/lib/clothing'
import { cn } from '@/lib/utils'
import { normalizeText } from '@/lib/text'

type ClosetFiltersProps = {
  value: ClosetFilterValue
  onChange: (value: ClosetFilterValue) => void
}

const visibilityOptions: { value: ClosetVisibilityFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'visibles', label: 'Visibles' },
  { value: 'privadas', label: 'Privadas' },
]

// Agrega o quita un valor de una lista
function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function ClosetFilters({ value, onChange }: ClosetFiltersProps) {
  const [typeQuery, setTypeQuery] = useState('')
  const search = normalizeText(typeQuery)
  const visibleZones = clothingZones
    .map(({ zone, label, types }) => ({
      zone,
      label,
      types: types.filter((type) => normalizeText(type.label).includes(search)),
    }))
    .filter(({ types }) => types.length > 0)
  const active = countClosetFilters(value)
  const set = (changes: Partial<ClosetFilterValue>) => onChange({ ...value, ...changes })

  return (
    // Al cerrar el menu se borra la busqueda de tipos
    <Popover onOpenChange={(open) => !open && setTypeQuery('')}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal />
          {/* En celular solo el icono, para que quepan los tres botones del closet en una fila */}
          <span className="max-sm:sr-only">Filtros</span>
          {active > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{active}</span>
          )}
        </Button>
      </PopoverTrigger>
      {/* Apertura rapida: crece desde el boton en 200 ms y se cierra en 150 ms */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="max-h-[var(--radix-popover-content-available-height)] w-[30rem] max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto p-4 ease-out data-closed:duration-150 data-open:duration-200 data-open:zoom-in-90 data-[side=bottom]:slide-in-from-top-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Filtros</h2>
          {/* Limpia los filtros del menu; la busqueda de arriba se queda */}
          <Button
            variant="ghost"
            size="sm"
            disabled={active === 0}
            onClick={() => onChange({ ...emptyClosetFilters, query: value.query })}
          >
            Limpiar
          </Button>
        </div>

        <FilterSection title="En tu perfil">
          <div className="flex flex-wrap gap-2">
            {visibilityOptions.map((option) => (
              <ChoicePill
                key={option.value}
                slideId="closet-visibility-filter"
                active={value.visibility === option.value}
                onClick={() => set({ visibility: option.value })}
              >
                {option.label}
              </ChoicePill>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Temporada">
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <ChoicePill
                key={season.value}
                active={value.seasons.includes(season.value)}
                onClick={() => set({ seasons: toggle(value.seasons, season.value) })}
              >
                {season.label}
              </ChoicePill>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {clothingColors.map((color) => {
              const selected = value.colors.includes(color.value)
              return (
                <button
                  key={color.value}
                  type="button"
                  aria-pressed={selected}
                  aria-label={color.label}
                  title={color.label}
                  onClick={() => set({ colors: toggle(value.colors, color.value) })}
                  className={cn(
                    'touch-target relative size-8 rounded-full border transition outline-none active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/50',
                    selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-popover',
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              )
            })}
          </div>
        </FilterSection>

        <FilterSection
          title="Tipo de prenda"
          action={
            <ExpandableSearch value={typeQuery} onChange={setTypeQuery} placeholder="Buscar tipo..." label="Buscar tipo" />
          }
        >
          <div className="max-h-64 overflow-y-auto rounded-md border">
            {visibleZones.length === 0 && <p className="p-3 text-sm text-muted-foreground">Sin resultados</p>}
            {visibleZones.map(({ zone, label, types }) => (
              <div key={zone} role="group" aria-labelledby={`zona-${zone}`} className="border-b p-2 last:border-b-0">
                <h4
                  id={`zona-${zone}`}
                  className="px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >
                  {label}
                </h4>
                <ul className="flex flex-col gap-1">
                  {types.map((type) => (
                    <li key={type.value}>
                      <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent has-[[data-state=checked]]:bg-accent">
                        <Checkbox
                          checked={value.types.includes(type.value)}
                          onCheckedChange={() => set({ types: toggle(value.types, type.value) })}
                        />
                        {type.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FilterSection>
      </PopoverContent>
    </Popover>
  )
}

function FilterSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
