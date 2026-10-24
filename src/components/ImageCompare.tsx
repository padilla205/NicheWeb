import { ChevronsLeftRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type ImageCompareProps = {
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
  className?: string
}

// Dos fotos encimadas con una linea que se arrastra para ver una u otra. El control es un
// slider nativo invisible encima: da arrastre con dedo o mouse y flechas del teclado sin codigo extra
export function ImageCompare({ before, after, beforeLabel, afterLabel, className }: ImageCompareProps) {
  const [position, setPosition] = useState(50)
  const label = 'absolute top-3 rounded-full bg-background/85 px-2 py-0.5 text-xs font-medium shadow-sm'

  return (
    <div className={cn('relative select-none', className)}>
      <img src={after} alt={afterLabel} className="absolute inset-0 size-full object-contain" />
      <img
        src={before}
        alt={beforeLabel}
        className="absolute inset-0 size-full bg-muted object-contain"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />
      <span className={cn(label, 'left-3')}>{beforeLabel}</span>
      <span className={cn(label, 'right-3')}>{afterLabel}</span>

      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow" style={{ left: `${position}%` }}>
        <span className="absolute top-1/2 left-1/2 flex size-9 -translate-1/2 items-center justify-center rounded-full bg-background text-foreground shadow-md">
          <ChevronsLeftRight className="size-4" />
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Comparar ${beforeLabel} con ${afterLabel}`}
        className="absolute inset-0 size-full cursor-ew-resize appearance-none opacity-0"
      />
    </div>
  )
}
