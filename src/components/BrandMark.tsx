import { cn } from '@/lib/utils'

// Una chamarra de contorno (la de enfrente del logo). La silueta toma el color del texto para funcionar sobre fondos claros y oscuros.
// El nombre accesible lo aporta el texto "Niche" que la acompana.
export function BrandMark({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('brand-mark size-8 shrink-0', className)} />
}
