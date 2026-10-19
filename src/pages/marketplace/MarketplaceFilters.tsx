import { SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { clothingColors, seasons } from '@/lib/clothing'
import {
  countActiveFilters,
  emptyFilters,
  type ListingFilters,
  listingConditions,
} from '@/lib/marketplace'
import { cn } from '@/lib/utils'

type MarketplaceFiltersProps = {
  value: ListingFilters
  onChange: (value: ListingFilters) => void
  // Tallas que existen en las ventas, para elegirlas con un toque
  sizes: string[]
}

// Agrega o quita un valor de una lista
function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

// Texto del campo de precio a numero; vacio = sin limite
function toPrice(text: string) {
  return text === '' ? undefined : Math.max(0, Number(text))
}

export function MarketplaceFilters({ value, onChange, sizes }: MarketplaceFiltersProps) {
  const active = countActiveFilters(value)
  const set = (changes: Partial<ListingFilters>) => onChange({ ...value, ...changes })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <SlidersHorizontal />
          Filtros
          {active > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{active}</span>
          )}
        </Button>
      </PopoverTrigger>
      {/* Misma apertura rapida que los filtros del closet */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="max-h-[var(--radix-popover-content-available-height)] w-[26rem] max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto p-4 ease-out data-closed:duration-150 data-open:duration-200 data-open:zoom-in-90 data-[side=bottom]:slide-in-from-top-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Filtros</h2>
          <Button variant="ghost" size="sm" disabled={active === 0} onClick={() => onChange(emptyFilters)}>
            Limpiar
          </Button>
        </div>

        <FilterSection title="Precio (MXN)">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Minimo"
              aria-label="Precio minimo"
              value={value.minPrice ?? ''}
              onChange={(event) => set({ minPrice: toPrice(event.target.value) })}
            />
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Maximo"
              aria-label="Precio maximo"
              value={value.maxPrice ?? ''}
              onChange={(event) => set({ maxPrice: toPrice(event.target.value) })}
            />
          </div>
        </FilterSection>

        {sizes.length > 0 && (
          <FilterSection title="Talla">
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <ChoicePill
                  key={size}
                  active={value.sizes.includes(size)}
                  onClick={() => set({ sizes: toggle(value.sizes, size) })}
                >
                  {size}
                </ChoicePill>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Estado">
          <div className="flex flex-wrap gap-2">
            {listingConditions.map((condition) => (
              <ChoicePill
                key={condition.value}
                active={value.conditions.includes(condition.value)}
                onClick={() => set({ conditions: toggle(value.conditions, condition.value) })}
              >
                {condition.label}
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
      </PopoverContent>
    </Popover>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}
