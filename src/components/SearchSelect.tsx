import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { normalizeText } from '@/lib/text'
import { cn } from '@/lib/utils'

export type SearchSelectGroup<T extends string> = {
  key: string
  label: string
  options: readonly { value: T; label: string }[]
}

type SearchSelectProps<T extends string> = {
  id?: string
  value: T | ''
  onChange: (value: T) => void
  groups: readonly SearchSelectGroup<T>[]
  placeholder: string
  searchPlaceholder: string
}

// Busca sin importar mayusculas ni acentos: "sueter" encuentra "Sueteres"
function filterOptions(label: string, search: string) {
  return normalizeText(label).includes(normalizeText(search)) ? 1 : 0
}

// Lista desplegable con buscador y opciones agrupadas (tipo de prenda, equipo, etc.)
export function SearchSelect<T extends string>({
  id,
  value,
  onChange,
  groups,
  placeholder,
  searchPlaceholder,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const selectedLabel = groups
    .flatMap((group) => group.options)
    .find((option) => option.value === value)?.label

  return (
    // "modal" permite usar la rueda del mouse en la lista aunque este dentro de otra ventana
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selectedLabel && 'text-muted-foreground')}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command filter={filterOptions}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.key} heading={group.label}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    data-checked={option.value === value}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
