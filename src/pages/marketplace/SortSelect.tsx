import { ArrowUpDown, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { type ListingSort, listingSorts } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

type SortSelectProps = {
  value: ListingSort
  onChange: (value: ListingSort) => void
  // "Mas cercanos" solo tiene sentido si ya elegiste tu ciudad
  canSortByDistance: boolean
}

// Boton de contorno que abre un menu con las formas de ordenar: crece desde el boton y cada opcion
// es un renglon alto, comodo para el dedo, con una palomita en la elegida
export function SortSelect({ value, onChange, canSortByDistance }: SortSelectProps) {
  const [open, setOpen] = useState(false)
  const options = listingSorts.filter((option) => option.value !== 'cercanos' || canSortByDistance)
  const current = listingSorts.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-full" aria-label={`Ordenar ventas: ${current?.label}`}>
          <ArrowUpDown />
          {current?.label}
        </Button>
      </PopoverTrigger>
      {/* Misma apertura que el menu de filtros: crece desde el boton en 200 ms y se cierra en 150 ms */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 gap-0 rounded-2xl p-1.5 ease-out data-closed:duration-150 data-open:duration-200 data-open:zoom-in-90 data-[side=bottom]:slide-in-from-top-3"
      >
        <div role="radiogroup" aria-label="Ordenar ventas" className="flex flex-col gap-0.5">
          {options.map((option) => {
            const selected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex h-11 items-center justify-between gap-3 rounded-xl px-3 text-left text-[15px] transition-colors duration-150 outline-none hover:bg-accent focus-visible:bg-accent md:h-9 md:text-sm',
                  selected && 'font-medium',
                )}
              >
                {option.label}
                {selected && <Check className="size-4" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
