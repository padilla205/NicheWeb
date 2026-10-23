import { Lock, type LucideIcon, Repeat2, Shirt, SquareUser, Tag } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { ShowMore } from '@/components/ShowMore'
import { useItems } from '@/hooks/useItems'
import { useMyListings } from '@/hooks/useListings'
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
  const { items, total: itemsTotal, isPending: itemsPending, loadMore: loadMoreItems } = useItems()
  // Incluye las vendidas: en el marketplace ya no salen, pero aqui las sigues viendo con su etiqueta
  const { listings: myListings, total: listingsTotal, isPending: listingsPending, loadMore: loadMoreListings } = useMyListings()

  const myPosts = posts.filter((post) => post.author.username === username)
  const sharedPosts = posts.filter((post) => post.sharedByMe)

  const tabs: { value: Tab; label: string; icon: LucideIcon; count: number }[] = [
    { value: 'posts', label: 'Publicaciones', icon: SquareUser, count: myPosts.length },
    { value: 'closet', label: 'Closet', icon: Shirt, count: itemsTotal },
    { value: 'shared', label: 'Compartidos', icon: Repeat2, count: sharedPosts.length },
    { value: 'selling', label: 'En venta', icon: Tag, count: listingsTotal },
  ]

  function select(value: Tab) {
    const order = tabs.map((option) => option.value)
    setDirection(order.indexOf(value) > order.indexOf(tab) ? 1 : -1)
    setTab(value)
  }

  return (
    // overflow-x-clip: el contenido que entra de lado no hace que la pagina se desplace horizontalmente
    <section className="flex flex-col gap-4 overflow-x-clip">
      {/* Barra fija: las 4 pestanas miden lo mismo y siempre caben, asi solo se mueve la rayita */}
      <div role="tablist" aria-label="Contenido del perfil" className="grid grid-cols-4 border-b">
        {tabs.map(({ value, label, icon: Icon, count }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => select(value)}
            className={cn(
              'relative flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 font-medium transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:justify-center sm:gap-2',
              tab === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {/* En celular: icono y numero arriba, nombre abajo en letra chica */}
            <span className="flex items-center gap-1.5 text-sm">
              <Icon className="size-4 shrink-0" />
              <span className="text-muted-foreground tabular-nums sm:hidden">{count}</span>
            </span>
            <span className="max-w-full truncate text-[11px] sm:text-sm">{label}</span>
            <span className="hidden text-sm text-muted-foreground tabular-nums sm:inline">{count}</span>
            {/* La rayita se desliza de la pestana anterior a la nueva */}
            {tab === value && (
              <motion.span
                layoutId="profile-tab-indicator"
                // Sin rebote: se desliza de lado y se detiene justo en su pestana
                transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}
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
          (itemsPending ? null : items.length === 0 ? (
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
              <ShowMore shown={items.length} total={itemsTotal} onClick={loadMoreItems} />
            </div>
          ))}
        {tab === 'shared' && (
          <PostGrid
            posts={sharedPosts}
            emptyText="Aun no compartes publicaciones. Usa el boton de compartir en el feed para traerlas aqui."
          />
        )}
        {tab === 'selling' &&
          (listingsPending ? null : myListings.length === 0 ? (
            <EmptyTab>No tienes prendas en venta. Publica una desde el Marketplace.</EmptyTab>
          ) : (
            <div className="flex flex-col">
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {myListings.map((listing) => (
                  <li key={listing.id}>
                    <ListingCard listing={listing} />
                  </li>
                ))}
              </ul>
              <ShowMore shown={myListings.length} total={listingsTotal} onClick={loadMoreListings} />
            </div>
          ))}
      </motion.div>
    </section>
  )
}
