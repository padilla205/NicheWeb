import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { getCityLabel } from '@/lib/locations'
import { formatPrice, getConditionLabel, type Listing } from '@/lib/marketplace'
import { ListingPhoto } from './ListingPhoto'
import { StatusBadge } from './StatusBadge'

// Tarjeta de la cuadricula; toda la tarjeta es un link a la pagina de la venta
export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card outline-none transition-transform duration-150 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]"
    >
      <ListingPhoto listing={listing} iconClassName="size-10" />
      {listing.status !== 'disponible' && <StatusBadge listing={listing} className="absolute top-2 left-2" />}
      <div className="flex flex-col gap-0.5 p-3">
        <p className="text-base font-semibold tabular-nums">{formatPrice(listing.price)}</p>
        <p className="truncate text-sm group-hover:underline">{listing.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          Talla {listing.size} · {getConditionLabel(listing.condition)}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          {getCityLabel(listing.location)}
        </p>
      </div>
    </Link>
  )
}
