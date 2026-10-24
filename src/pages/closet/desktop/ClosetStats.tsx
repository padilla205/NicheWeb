import { type LucideIcon, Repeat2, Shirt, Sparkles, Store } from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import { useMyListings } from '@/hooks/useListings'
import { useOutfits } from '@/hooks/useOutfits'
import { useSharedPosts } from '@/hooks/usePosts'
import { useProfile } from '@/hooks/useProfile'

// Cuatro numeros del closet, solo en escritorio. Usan los mismos datos que el resto de la app
// (no hay consultas nuevas); mientras cargan se ve un guion
export function useClosetStats() {
  const { id } = useProfile()
  const items = useItems()
  const { data: outfits } = useOutfits(id)
  const shared = useSharedPosts(id)
  // ponytail: incluye ventas apartadas y vendidas (igual que la pestana "En venta" del perfil);
  // contar solo las disponibles necesitaria una consulta por estado
  const listings = useMyListings()

  return {
    items: items.isPending ? null : items.total,
    // Las mismas prendas ya cargadas sirven para saber si alguna tiene color
    hasColors: items.items.some((item) => item.colors.length > 0),
    outfits: outfits?.length ?? null,
    shared: shared.isPending ? null : shared.total,
    listings: listings.isPending ? null : listings.total,
  }
}

const cards: { key: 'items' | 'outfits' | 'shared' | 'listings'; label: string; icon: LucideIcon }[] = [
  { key: 'items', label: 'Prendas', icon: Shirt },
  { key: 'outfits', label: 'Outfits', icon: Sparkles },
  { key: 'shared', label: 'Compartidas', icon: Repeat2 },
  { key: 'listings', label: 'En venta', icon: Store },
]

export function ClosetStats() {
  const stats = useClosetStats()
  return (
    <ul className="mb-6 grid grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <li key={key} className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
            <Icon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="text-xl font-semibold tabular-nums">{stats[key] ?? '-'}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
