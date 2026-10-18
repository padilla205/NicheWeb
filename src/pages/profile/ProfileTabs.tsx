import { type LucideIcon, Repeat2, Shirt, SquareUser, Tag } from 'lucide-react'
import { useState } from 'react'
import { useItems } from '@/hooks/useItems'
import { useListings } from '@/hooks/useListings'
import { useProfile } from '@/hooks/useProfile'
import { usePosts } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
import { ClosetGrid } from '@/pages/closet/ClosetGrid'
import { ListingCard } from '@/pages/marketplace/ListingCard'
import { EmptyTab } from './EmptyTab'
import { PostGrid } from './PostGrid'

type Tab = 'posts' | 'closet' | 'shared' | 'selling'

export function ProfileTabs() {
  const [tab, setTab] = useState<Tab>('posts')
  const { username } = useProfile()
  const posts = usePosts()
  const items = useItems()
  const listings = useListings()

  const myPosts = posts.filter((post) => post.author.username === username)
  const sharedPosts = posts.filter((post) => post.sharedByMe)
  const myListings = listings.filter((listing) => listing.seller.username === username)

  const tabs: { value: Tab; label: string; icon: LucideIcon; count: number }[] = [
    { value: 'posts', label: 'Publicaciones', icon: SquareUser, count: myPosts.length },
    { value: 'closet', label: 'Closet', icon: Shirt, count: items.length },
    { value: 'shared', label: 'Compartidos', icon: Repeat2, count: sharedPosts.length },
    { value: 'selling', label: 'En venta', icon: Tag, count: myListings.length },
  ]

  return (
    <section className="flex flex-col gap-4">
      {/* En celular las pestanas se pueden deslizar de lado si no caben */}
      <div
        role="tablist"
        aria-label="Contenido del perfil"
        className="flex gap-1 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map(({ value, label, icon: Icon, count }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'touch-target -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              tab === value
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
            <span className="text-muted-foreground tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'posts' && (
          <PostGrid posts={myPosts} emptyText="Aun no publicas outfits. Cuando lo hagas apareceran aqui." />
        )}
        {tab === 'closet' &&
          (items.length === 0 ? (
            <EmptyTab>Aun no tienes prendas. Agregalas desde la seccion Closet.</EmptyTab>
          ) : (
            <ClosetGrid items={items} />
          ))}
        {tab === 'shared' && (
          <PostGrid
            posts={sharedPosts}
            emptyText="Aun no compartes publicaciones. Usa el boton de compartir en el feed para traerlas aqui."
          />
        )}
        {tab === 'selling' &&
          (myListings.length === 0 ? (
            <EmptyTab>No tienes prendas en venta. Publica una desde el Marketplace.</EmptyTab>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {myListings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} />
                </li>
              ))}
            </ul>
          ))}
      </div>
    </section>
  )
}
