import { Lock, type LucideIcon, Repeat2, Shirt, SquareUser, Tag } from 'lucide-react'
import { motion } from 'motion/react'
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
  // Hacia que lado se movio: 1 si la nueva pestana esta a la derecha, -1 si esta a la izquierda
  const [direction, setDirection] = useState(1)
  const { username, closetPublic } = useProfile()
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

  function select(value: Tab) {
    const order = tabs.map((option) => option.value)
    setDirection(order.indexOf(value) > order.indexOf(tab) ? 1 : -1)
    setTab(value)
  }

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
            onClick={() => select(value)}
            className={cn(
              'touch-target relative flex shrink-0 items-center gap-2 px-3 py-2.5 text-sm font-medium transition duration-150 outline-none active:scale-[0.96] focus-visible:ring-3 focus-visible:ring-ring/50',
              tab === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" />
            {label}
            <span className="text-muted-foreground tabular-nums">{count}</span>
            {/* La rayita se desliza de la pestana anterior a la nueva */}
            {tab === value && (
              <motion.span
                layoutId="profile-tab-indicator"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground"
              />
            )}
          </button>
        ))}
      </div>

      {/* El contenido entra desde el lado hacia el que te moviste */}
      <motion.div
        key={tab}
        role="tabpanel"
        initial={{ opacity: 0, x: direction * 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}
      >
        {tab === 'posts' && (
          <PostGrid posts={myPosts} emptyText="Aun no publicas outfits. Cuando lo hagas apareceran aqui." />
        )}
        {tab === 'closet' &&
          (items.length === 0 ? (
            <EmptyTab>Aun no tienes prendas. Agregalas desde la seccion Closet.</EmptyTab>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Por ahora solo tu ves tu propio perfil; esto avisa que los demas no veran tu closet */}
              {!closetPublic ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4 shrink-0" />
                  Tu closet es privado: solo tu lo ves. Puedes hacerlo publico desde la seccion Closet.
                </p>
              ) : (
                items.some((item) => item.private) && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-4 shrink-0" />
                    Las prendas con candado son privadas: solo tu las ves.
                  </p>
                )
              )}
              <ClosetGrid items={items} />
            </div>
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
      </motion.div>
    </section>
  )
}
