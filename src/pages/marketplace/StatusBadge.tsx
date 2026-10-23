import { getStatusLabel, type Listing } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

// Etiqueta "Apartada" o "Vendida" sobre la foto o junto al titulo
export function StatusBadge({ listing, className }: { listing: Pick<Listing, 'status'>; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm',
        listing.status === 'vendida' ? 'bg-black/70 text-white' : 'bg-amber-400/90 text-black',
        className,
      )}
    >
      {getStatusLabel(listing.status)}
    </span>
  )
}
