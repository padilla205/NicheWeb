import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { useSellerStats } from '@/hooks/useListings'
import type { Listing } from '@/lib/marketplace'
import { UserAvatar } from '@/pages/feed/UserAvatar'

const monthYear = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })

// Quien vende: foto, nombre, desde cuando esta en Niche y cuantas ventas completo. Lleva a su perfil
export function SellerCard({ listing }: { listing: Listing }) {
  const { data: stats } = useSellerStats(listing.sellerId)
  const { seller } = listing

  return (
    <Link
      to={`/u/${seller.username}`}
      className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors duration-150 hover:bg-accent"
    >
      <UserAvatar user={seller} className="size-12" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium">
          {seller.name} <span className="font-normal text-muted-foreground">@{seller.username}</span>
        </p>
        {stats ? (
          <p className="text-muted-foreground">
            En Niche desde {monthYear.format(stats.memberSince)}
            {' · '}
            {stats.sold === 0
              ? 'aun sin ventas completadas'
              : `${stats.sold} ${stats.sold === 1 ? 'venta completada' : 'ventas completadas'}`}
          </p>
        ) : (
          <div aria-hidden className="mt-1 h-3.5 w-2/3 animate-pulse rounded bg-muted" />
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
