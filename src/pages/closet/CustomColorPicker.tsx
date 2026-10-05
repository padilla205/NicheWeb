import { Plus } from 'lucide-react'
import { useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type CustomColorPickerProps = {
  disabled: boolean
  triggerClassName: string
  // Recibe el color confirmado en formato "#1e90ff"
  onAdd: (hex: string) => void
}

export function CustomColorPicker({ disabled, triggerClassName, onAdd }: CustomColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState('#1e90ff')

  function handleAdd() {
    onAdd(hex.toLowerCase())
    setOpen(false)
  }

  return (
    // "modal" hace que funcione bien dentro del dialogo de agregar prenda
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Elegir otro color"
          title="Elegir otro color"
          disabled={disabled}
          className={cn(triggerClassName, 'border-dashed text-muted-foreground')}
        >
          <Plus className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 gap-3 p-3">
        <HexColorPicker color={hex} onChange={setHex} className="custom-color-picker" />
        <div className="flex items-center gap-2">
          <span
            className="size-8 shrink-0 rounded-full outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            style={{ backgroundColor: hex }}
            aria-hidden
          />
          <HexColorInput
            color={hex}
            onChange={setHex}
            prefixed
            aria-label="Codigo del color"
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2.5 font-mono text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button type="button" size="sm" onClick={handleAdd}>
          Agregar color
        </Button>
      </PopoverContent>
    </Popover>
  )
}
