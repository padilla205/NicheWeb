import { SlidersHorizontal } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChoicePill } from '@/components/ChoicePill'
import { CircleAction } from '@/components/CircleAction'
import { MorphDialog } from '@/components/MorphDialog'
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
  // Marcas que existen en las ventas
  brands: string[]
  // Como atajo en circulo, para la cabecera negra del celular
  circle?: boolean
}

// Agrega o quita un valor de una lista
function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

// Texto del campo de precio a numero; vacio = sin limite
function toPrice(text: string) {
  return text === '' ? undefined : Math.max(0, Number(text))
}

export function MarketplaceFilters({ value, onChange, sizes, brands, circle = false }: MarketplaceFiltersProps) {
  const [open, setOpen] = useState(false)
  // Celular: boton en circulo que abre una ventana al frente (la que sale del boton, como Crear venta)
  const [origin, setOrigin] = useState<HTMLElement | null>(null)
  const active = countActiveFilters(value)
  const fields = <FilterFields value={value} onChange={onChange} sizes={sizes} brands={brands} />

  if (circle) {
    return (
      <>
        <CircleAction
          icon={SlidersHorizontal}
          label="Filtros"
          badge={active}
          hidden={origin !== null}
          iconTurn={180}
          onClick={(event) => setOrigin(event.currentTarget)}
        />
        {/* A la pagina, fuera de la cabecera negra: si no, tomaria sus colores oscuros en modo claro */}
        {createPortal(
        <MorphDialog swipeUpToClose fullscreenOnMobile origin={origin} onClose={() => setOrigin(null)} title="Filtros" description="Elige que ventas quieres ver.">
          {fields}
          <div className="sticky -bottom-[calc(1rem+env(safe-area-inset-bottom))] -mx-4 -mb-[calc(1rem+env(safe-area-inset-bottom))] mt-auto flex gap-2 border-t bg-popover p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Button variant="outline" className="flex-1 rounded-full" disabled={active === 0} onClick={() => onChange(emptyFilters)}>
              Limpiar
            </Button>
            <Button className="flex-1 rounded-full" onClick={() => setOrigin(null)}>
              Ver ventas
            </Button>
          </div>
        </MorphDialog>,
          document.body,
        )}
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        {fields}
      </PopoverContent>
    </Popover>
  )
}

type FilterFieldsProps = Omit<MarketplaceFiltersProps, 'circle'>

// Los filtros en si (precio, talla, marca, estado, color y temporada), iguales en las dos versiones
function FilterFields({ value, onChange, sizes, brands }: FilterFieldsProps) {
  const set = (changes: Partial<ListingFilters>) => onChange({ ...value, ...changes })
  return (
    <>
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

    {brands.length > 0 && (
      <FilterSection title="Marca">
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <ChoicePill
              key={brand}
              active={value.brands.includes(brand)}
              onClick={() => set({ brands: toggle(value.brands, brand) })}
            >
              {brand}
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
                'touch-target relative size-10 rounded-full border md:size-8 transition outline-none active:scale-[0.92] focus-visible:ring-3 focus-visible:ring-ring/50',
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
    </>
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
