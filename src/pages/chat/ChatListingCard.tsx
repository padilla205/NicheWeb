import { Shirt } from 'lucide-react'
import { Link } from 'react-router'
import type { ChatListing } from '@/lib/chat'
import { formatPrice } from '@/lib/marketplace'
import { StatusBadge } from '@/pages/marketplace/StatusBadge'

// La prenda de la que se habla, al inicio de la conversacion; al tocarla se abre la venta
export function ChatListingCard({ listing }: { listing: ChatListing }) {
  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="mx-auto mb-2 flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-card p-2.5 transition-colors duration-150 hover:bg-accent"
    >
      {listing.thumbUrl ? (
        <img src={listing.thumbUrl} alt="" loading="lazy" className="size-16 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Shirt className="size-6 text-muted-foreground" strokeWidth={1.5} />
        </span>
      )}
      <div className="flex min-w-0 flex-col items-start gap-1">
        <p className="w-full truncate text-sm font-medium">{listing.title}</p>
        <p className="text-sm font-semibold tabular-nums">{formatPrice(listing.price)}</p>
        {listing.status !== 'disponible' && <StatusBadge listing={listing} className="py-0.5" />}
      </div>
    </Link>
  )
}
