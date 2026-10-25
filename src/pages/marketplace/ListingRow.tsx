import type { Listing } from '@/lib/marketplace'
import { ListingCard } from './ListingCard'

// Fila de ventas que se desliza de lado ("Mas de este vendedor", "Te puede gustar")
export function ListingRow({ title, listings }: { title: string; listings: Listing[] }) {
  if (listings.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pt-1 pb-3 md:mx-0 md:px-0">
        {listings.map((listing) => (
          <li key={listing.id} className="w-40 shrink-0 snap-start sm:w-48">
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </section>
  )
}
