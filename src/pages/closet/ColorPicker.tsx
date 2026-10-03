import { Check, Plus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { clothingColors, getColorInfo } from '@/lib/clothing'
import { cn } from '@/lib/utils'

const MAX_COLORS = 5

type ColorPickerProps = {
  // Colores de la lista ("azul") o personalizados en formato "#1e90ff", en el orden en que se eligieron
  value: string[]
  onChange: (value: string[]) => void
}

const swatchClass =
  'relative flex size-8 items-center justify-center rounded-full border transition-transform duration-150 outline-none hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100'
const selectedClass = 'ring-2 ring-primary ring-offset-2 ring-offset-popover'

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const customRef = useRef<HTMLInputElement>(null)
  const isFull = value.length >= MAX_COLORS
  const customColors = value.filter((color) => color.startsWith('#'))

  function toggle(color: string) {
    if (value.includes(color)) onChange(value.filter((c) => c !== color))
    else if (!isFull) onChange([...value, color])
  }

  // El selector del navegador avisa en cada movimiento; "change" solo llega al confirmar el color,
  // asi se agrega uno solo y no uno por cada tono que se recorrio
  useEffect(() => {
    const input = customRef.current
    if (!input) return
    const handleChange = () => {
      if (!value.includes(input.value) && !isFull) onChange([...value, input.value])
      // Se reinicia para poder volver a elegir el mismo tono si se quito antes
      input.value = '#000000'
    }
    input.addEventListener('change', handleChange)
    return () => input.removeEventListener('change', handleChange)
  }, [value, isFull, onChange])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Colores">
        {clothingColors.map((color) => {
          const active = value.includes(color.value)
          return (
            <button
              key={color.value}
              type="button"
              aria-pressed={active}
              aria-label={color.label}
              title={color.label}
              disabled={!active && isFull}
              onClick={() => toggle(color.value)}
              style={{ backgroundColor: color.hex }}
              className={cn(swatchClass, active && selectedClass)}
            >
              {active && (
                <Check className={cn('size-4', color.light ? 'text-black' : 'text-white')} />
              )}
            </button>
          )
        })}

        {/* Colores personalizados ya elegidos: tocarlos los quita */}
        {customColors.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-pressed
            aria-label="Quitar color personalizado"
            title="Quitar color personalizado"
            onClick={() => toggle(hex)}
            style={{ backgroundColor: hex }}
            className={cn(swatchClass, selectedClass)}
          >
            <Check className="size-4 text-white mix-blend-difference" />
          </button>
        ))}

        {/* Agregar otro color con el selector del navegador (aparece junto a este boton) */}
        <div className="relative">
          <button
            type="button"
            aria-label="Agregar otro color"
            title="Agregar otro color"
            disabled={isFull}
            onClick={() => customRef.current?.click()}
            className={cn(swatchClass, 'border-dashed text-muted-foreground')}
          >
            <Plus className="size-4" />
          </button>
          <input
            ref={customRef}
            type="color"
            defaultValue="#000000"
            className="pointer-events-none absolute inset-0 size-full opacity-0"
            tabIndex={-1}
            aria-hidden
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? `Elige hasta ${MAX_COLORS} colores`
          : `${value.map((color) => getColorInfo(color).label).join(', ')} (${value.length} de ${MAX_COLORS})`}
      </p>
    </div>
  )
}
