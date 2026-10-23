import { Shirt } from 'lucide-react'
import type { Listing } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

type ListingPhotoProps = {
  listing: Listing
  className?: string
  iconClassName?: string
}

// Portada chica de la venta para las tarjetas; sin foto se ve un icono
export function ListingPhoto({ listing, className, iconClassName }: ListingPhotoProps) {
  if (listing.thumbUrl) {
    return (
      <div className={cn('aspect-square overflow-hidden bg-muted', className)}>
        <img src={listing.thumbUrl} alt={listing.title} loading="lazy" className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div role="img" aria-label={listing.title} className={cn('flex aspect-square items-center justify-center bg-muted', className)}>
      <Shirt className={cn('text-muted-foreground', iconClassName)} strokeWidth={1.5} />
    </div>
  )
}
