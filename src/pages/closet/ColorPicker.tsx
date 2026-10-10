import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { clothingColors, getColorInfo } from '@/lib/clothing'
import { popIn } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { CustomColorPicker } from './CustomColorPicker'

const MAX_COLORS = 5

type ColorPickerProps = {
  // Colores de la lista ("azul") o personalizados en formato "#1e90ff", en el orden en que se eligieron
  value: string[]
  onChange: (value: string[]) => void
}

// Solo se animan escala y anillo (box-shadow); al presionar se hunde a 0.96 como respuesta tactil
const swatchClass =
  'touch-target relative flex size-8 items-center justify-center rounded-full border transition-[scale,box-shadow] duration-150 ease-out outline-none hover:scale-110 active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100'
const selectedClass = 'ring-2 ring-primary ring-offset-2 ring-offset-popover'

function AnimatedCheck({ show, className }: { show: boolean; className: string }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span key="check" className="absolute inset-0 flex items-center justify-center" {...popIn}>
          <Check className={cn('size-4', className)} />
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const isFull = value.length >= MAX_COLORS
  const customColors = value.filter((color) => color.startsWith('#'))

  function toggle(color: string) {
    if (value.includes(color)) onChange(value.filter((c) => c !== color))
    else if (!isFull) onChange([...value, color])
  }

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
              <AnimatedCheck show={active} className={color.light ? 'text-black' : 'text-white'} />
            </button>
          )
        })}

        {/* Colores personalizados ya elegidos: tocarlos los quita */}
        <AnimatePresence initial={false}>
          {customColors.map((hex) => (
            <motion.button
              key={hex}
              {...popIn}
              type="button"
              aria-pressed
              aria-label="Quitar color personalizado"
              title="Quitar color personalizado"
              onClick={() => toggle(hex)}
              style={{ backgroundColor: hex }}
              className={cn(swatchClass, selectedClass)}
            >
              <Check className="size-4 text-white mix-blend-difference" />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Elegir un color fuera de la lista con el selector propio */}
        <CustomColorPicker
          disabled={isFull}
          triggerClassName={swatchClass}
          onAdd={(hex) => {
            if (!value.includes(hex) && !isFull) onChange([...value, hex])
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length === 0
          ? `Elige hasta ${MAX_COLORS} colores`
          : `${value.map((color) => getColorInfo(color).label).join(', ')} (${value.length} de ${MAX_COLORS})`}
      </p>
    </div>
  )
}
