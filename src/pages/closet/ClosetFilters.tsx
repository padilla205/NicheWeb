import { SlidersHorizontal } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChoicePill } from '@/components/ChoicePill'
import { ExpandableSearch } from '@/components/ExpandableSearch'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CircleAction } from '@/components/CircleAction'
import { MorphDialog } from '@/components/MorphDialog'
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
  // Boton en circulo, para la cabecera negra del celular
  circle?: boolean
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

export function ClosetFilters({ value, onChange, circle = false }: ClosetFiltersProps) {
  const [open, setOpen] = useState(false)
  // Celular: boton en circulo que abre una ventana al frente, igual que los filtros del marketplace
  const [origin, setOrigin] = useState<HTMLElement | null>(null)
  const active = countClosetFilters(value)
  // Limpia los filtros del menu; la busqueda de arriba se queda
  const clear = () => onChange({ ...emptyClosetFilters, query: value.query })
  // Se monta solo mientras esta abierto, asi la busqueda de tipos se borra al cerrar
  const fields = <FilterFields value={value} onChange={onChange} />

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
          <MorphDialog swipeUpToClose fullscreenOnMobile origin={origin} onClose={() => setOrigin(null)} title="Filtros" description="Elige que prendas quieres ver.">
            {fields}
            <div className="sticky -bottom-[calc(1rem+env(safe-area-inset-bottom))] -mx-4 -mb-[calc(1rem+env(safe-area-inset-bottom))] mt-auto flex gap-2 border-t bg-popover p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Button variant="outline" className="flex-1 rounded-full" disabled={active === 0} onClick={clear}>
                Limpiar
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => setOrigin(null)}>
                Ver prendas
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
          <Button variant="ghost" size="sm" disabled={active === 0} onClick={clear}>
            Limpiar
          </Button>
        </div>
        {fields}
      </PopoverContent>
    </Popover>
  )
}

// Los filtros en si (perfil, temporada, color y tipo), iguales en las dos versiones
function FilterFields({ value, onChange }: Omit<ClosetFiltersProps, 'circle'>) {
  const [typeQuery, setTypeQuery] = useState('')
  const search = normalizeText(typeQuery)
  const visibleZones = clothingZones
    .map(({ zone, label, types }) => ({
      zone,
      label,
      types: types.filter((type) => normalizeText(type.label).includes(search)),
    }))
    .filter(({ types }) => types.length > 0)
  const set = (changes: Partial<ClosetFilterValue>) => onChange({ ...value, ...changes })

  return (
    <>
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
    </>
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
