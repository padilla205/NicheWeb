import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { getCityLabel } from '@/lib/locations'
import { hoverLift } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatPrice, getConditionLabel, type Listing } from '@/lib/marketplace'
import { FavoriteButton } from './FavoriteButton'
import { ListingPhoto } from './ListingPhoto'
import { StatusBadge } from './StatusBadge'

const DAY_MS = 24 * 60 * 60 * 1000

// Tarjeta de la cuadricula; toda la tarjeta es un link a la pagina de la venta. El corazon va encima,
// fuera del link (un boton no puede ir dentro de un link)
export function ListingCard({ listing }: { listing: Listing }) {
  // Publicada hace menos de 24 horas y aun disponible. Dice "Recien publicada" y no "Nuevo"
  // para no confundirse con el estado de la prenda (Nuevo, Como nuevo, Usado)
  const isNew = listing.status === 'disponible' && Date.now() - listing.createdAt.getTime() < DAY_MS
  return (
    <div
      className={cn(
        'group relative rounded-2xl',
        // Sube con el mouse y se encoge apenas al presionarla
        hoverLift,
        'transition-[translate,box-shadow,scale] motion-safe:has-[a:active]:scale-[0.98]',
      )}
    >
      <Link
        to={`/marketplace/${listing.id}`}
        className="relative flex flex-col overflow-hidden rounded-2xl border bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ListingPhoto listing={listing} iconClassName="size-10" />
        {listing.status !== 'disponible' && <StatusBadge listing={listing} className="absolute top-2 left-2" />}
        {isNew && (
          <span className="absolute top-2 left-2 rounded-full bg-editorial px-2.5 py-1 text-xs font-medium text-editorial-foreground">
            Recien publicada
          </span>
        )}
        <div className="flex flex-col gap-0.5 p-3">
          <p className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-base font-semibold">{formatPrice(listing.price)}</span>
            {/* Rebajada: el precio de antes tachado */}
            {listing.previousPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(listing.previousPrice)}</span>
            )}
          </p>
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
      <FavoriteButton listing={listing} className="absolute top-2 right-2" />
    </div>
  )
}
