import { Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ExpandableSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

// Boton de lupa que se convierte en barra de busqueda solo cuando el usuario le da clic
export function ExpandableSearch({ value, onChange, placeholder, label }: ExpandableSearchProps) {
  const [expanded, setExpanded] = useState(value !== '')

  return (
    <div
      className={cn(
        'relative h-8 transition-[width] duration-200 ease-out',
        expanded ? 'w-48' : 'w-8',
      )}
    >
      {expanded ? (
        <>
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            // Si sale del buscador sin haber escrito nada, se vuelve a cerrar
            onBlur={() => value === '' && setExpanded(false)}
            placeholder={placeholder}
            aria-label={label}
            className="h-8 rounded-full pl-8"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={label}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
        >
          <Search className="size-4" />
        </button>
      )}
    </div>
  )
}
