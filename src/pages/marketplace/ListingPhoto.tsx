import { Shirt } from 'lucide-react'
import type { Listing } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

type ListingPhotoProps = {
  listing: Listing
  className?: string
  iconClassName?: string
}

// Portada de la venta. TEMPORAL: las ventas de ejemplo no tienen foto y muestran un degradado con un icono
export function ListingPhoto({ listing, className, iconClassName }: ListingPhotoProps) {
  const cover = listing.photoUrls[0]
  if (cover) {
    return (
      <div className={cn('aspect-square overflow-hidden bg-muted', className)}>
        <img src={cover} alt={listing.title} loading="lazy" className="size-full object-cover" />
      </div>
    )
  }

  const [from, to] = listing.gradient ?? ['#d4d4d8', '#a1a1aa']
  return (
    <div
      role="img"
      aria-label={listing.title}
      className={cn('flex aspect-square items-center justify-center', className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <Shirt className={cn('text-white/70', iconClassName)} strokeWidth={1.5} />
    </div>
  )
}
