import { Search } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import { type ReactNode, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { cleanSearch, useSearch } from '@/hooks/useSearch'
import { cascade } from '@/lib/motion'
import { PostPhoto } from '@/pages/feed/PostPhoto'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { ListingCard } from '@/pages/marketplace/ListingCard'

// Seccion de busqueda (/buscar?q=...): personas, ventas y publicaciones.
// La barra donde se escribe vive arriba, en la barra superior
export function SearchPage() {
  const [params] = useSearchParams()
  const text = params.get('q') ?? ''
  // Busca cuando dejas de escribir un momento, no con cada letra
  const [debounced, setDebounced] = useState(text)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(text), 300)
    return () => window.clearTimeout(timer)
  }, [text])
  const { data, isFetching } = useSearch(debounced)
  const ready = cleanSearch(debounced).length >= 2

  if (!ready) {
    return (
      <Hint>
        <Search className="size-8" strokeWidth={1.5} />
        Busca personas por su nombre o usuario, prendas en venta u outfits publicados.
      </Hint>
    )
  }

  if (!data) return <ResultsSkeleton />

  const { people, listings, posts } = data
  if (people.length + listings.length + posts.length === 0) {
    return <Hint>{isFetching ? 'Buscando...' : `No encontramos nada para "${debounced.trim()}".`}</Hint>
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {people.length > 0 && (
          <Section title="Personas">
            <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {people.map((person, index) => (
                <motion.li key={person.id} {...cascade(index)} className="shrink-0">
                  <Link
                    to={`/u/${person.username}`}
                    className="flex w-20 flex-col items-center gap-1.5 rounded-xl p-1 text-center hover:bg-accent"
                  >
                    <UserAvatar user={person} className="size-14 text-base" />
                    <span className="w-full truncate text-xs font-medium">{person.name}</span>
                    <span className="-mt-1 w-full truncate text-[11px] text-muted-foreground">@{person.username}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </Section>
        )}

        {listings.length > 0 && (
          <Section title="Ventas">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing, index) => (
                <motion.li key={listing.id} {...cascade(index)}>
                  <ListingCard listing={listing} />
                </motion.li>
              ))}
            </ul>
          </Section>
        )}

        {posts.length > 0 && (
          <Section title="Publicaciones">
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {posts.map((post, index) => (
                <motion.li key={post.id} {...cascade(index)}>
                  <Link
                    to={`/p/${post.id}`}
                    aria-label={`Publicacion de ${post.author.username}`}
                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted"
                  >
                    <PostPhoto post={post} iconClassName="size-6" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </MotionConfig>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto flex max-w-sm flex-col items-center gap-3 py-20 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

// Formas grises de personas y tarjetas mientras llega la primera busqueda
function ResultsSkeleton() {
  return (
    <div aria-hidden className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex w-20 flex-col items-center gap-2">
            <div className="size-14 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
