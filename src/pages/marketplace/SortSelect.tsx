import { ArrowUpDown } from 'lucide-react'
import { type ListingSort, listingSorts } from '@/lib/marketplace'

type SortSelectProps = {
  value: ListingSort
  onChange: (value: ListingSort) => void
  // "Mas cercanos" solo tiene sentido si ya elegiste tu ciudad
  canSortByDistance: boolean
}

// Lista nativa del navegador: en el celular abre el selector del sistema, comodo para el dedo
export function SortSelect({ value, onChange, canSortByDistance }: SortSelectProps) {
  const options = listingSorts.filter((option) => option.value !== 'cercanos' || canSortByDistance)
  return (
    <label className="touch-target relative flex h-8 shrink-0 items-center rounded-full border bg-background text-sm font-medium transition-colors hover:bg-muted focus-within:ring-3 focus-within:ring-ring/50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
      <ArrowUpDown className="pointer-events-none absolute left-2.5 size-4" aria-hidden="true" />
      <span className="sr-only">Ordenar ventas</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ListingSort)}
        className="h-full cursor-pointer appearance-none rounded-full bg-transparent pr-3 pl-8 outline-none [&>option]:bg-popover [&>option]:text-popover-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
