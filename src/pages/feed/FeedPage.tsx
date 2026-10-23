import { EyeOff, Plus, Users } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import { useCallback, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { Button } from '@/components/ui/button'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import { useFeaturedPosts, useFeed, useToggleHiddenAuthor } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'
import { type Season, seasons } from '@/lib/clothing'
import { EmptyTab } from '@/pages/profile/EmptyTab'
import { PostDetail } from '@/pages/profile/PostDetail'
import { FeaturedPosts } from './FeaturedPosts'
import { FeedCard } from './FeedCard'
import { PublishPostDialog } from './PublishPostDialog'

type Tab = 'for-you' | 'following'

export function FeedPage() {
  const [tab, setTab] = useState<Tab>('for-you')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  // Boton que abrio "Crear publicacion"; null si la ventana esta cerrada
  const [publishOrigin, setPublishOrigin] = useState<HTMLElement | null>(null)
  const closePublish = useCallback(() => setPublishOrigin(null), [])
  const toggleHidden = useToggleHiddenAuthor()
  // Ultima persona ocultada, para poder deshacerlo
  const [hiddenAuthor, setHiddenAuthor] = useState<Post | null>(null)

  // El menu del autor ya lo oculto; aqui solo se muestra el aviso y se cierra la publicacion abierta
  function onAuthorHidden(post: Post) {
    setHiddenAuthor(post)
    setOpenId(null)
  }

  function undoHide() {
    if (!hiddenAuthor) return
    toggleHidden.mutate({ authorId: hiddenAuthor.authorId, hidden: false })
    setHiddenAuthor(null)
  }
  const feed = useFeed({ following: tab === 'following', seasons: selectedSeasons })
  // La pagina no sube al cambiar de pestana o temporada
  const keep = useKeepScroll(`${tab}-${selectedSeasons.join()}`)
  const { featured, secondsRemaining } = useFeaturedPosts()
  // Se busca en las dos listas para que la publicacion abierta refleje likes al instante
  const openPost = [...feed.posts, ...featured].find((post) => post.id === openId)

  function toggleSeason(season: Season) {
    setSelectedSeasons((current) =>
      current.includes(season) ? current.filter((s) => s !== season) : [...current, season],
    )
  }

  return (
    // Si el sistema pide menos movimiento, las animaciones del feed se reducen
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-3">
          <PageTitle title="Feed" />
          <MorphButton hidden={publishOrigin !== null} onOpen={setPublishOrigin}>
            <Plus />
            Crear publicacion
          </MorphButton>
        </div>
        <FeaturedPosts featured={featured} secondsRemaining={secondsRemaining} onOpen={setOpenId} />

        {/* En celular las pastillas se deslizan de lado en una sola fila */}
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <ChoicePill active={tab === 'for-you'} onClick={() => setTab('for-you')}>
            Para ti
          </ChoicePill>
          <ChoicePill active={tab === 'following'} onClick={() => setTab('following')}>
            Siguiendo
          </ChoicePill>
          <span aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-border" />
          {seasons.map(({ value, label }) => (
            <ChoicePill key={value} active={selectedSeasons.includes(value)} onClick={() => toggleSeason(value)}>
              {label}
            </ChoicePill>
          ))}
        </div>

        {hiddenAuthor && (
          <div role="status" className="mb-4 flex items-center gap-3 rounded-2xl border bg-card px-4 py-2.5 text-sm">
            <EyeOff className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Ya no veras publicaciones de @{hiddenAuthor.author.username}.</span>
            <Button variant="ghost" size="sm" onClick={undoHide}>
              Deshacer
            </Button>
          </div>
        )}

        <div ref={keep.ref} style={keep.style}>
          {feed.isPending ? (
            <FeedSkeleton />
          ) : feed.posts.length === 0 ? (
            <EmptyTab>
              {tab === 'following' ? (
                <span className="flex items-center justify-center gap-2">
                  <Users className="size-4 shrink-0" />
                  Cuando sigas a alguien, sus outfits apareceran aqui.
                </span>
              ) : selectedSeasons.length > 0 ? (
                'No hay outfits de esa temporada todavia.'
              ) : (
                'Aun no hay outfits. Publica el primero con Crear publicacion.'
              )}
            </EmptyTab>
          ) : (
            // ponytail: columnas de CSS (tipo Pinterest); el orden va de arriba hacia abajo por columna
            <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
              {feed.posts.map((post) => (
                <FeedCard key={post.id} post={post} onOpen={() => setOpenId(post.id)} onAuthorHidden={() => onAuthorHidden(post)} />
              ))}
            </div>
          )}
          <ShowMore shown={feed.posts.length} total={feed.total} onClick={feed.loadMore} />
        </div>
      </div>
      {openPost && (
        <PostDetail post={openPost} onClose={() => setOpenId(null)} onAuthorHidden={() => onAuthorHidden(openPost)} />
      )}
      <PublishPostDialog origin={publishOrigin} onClose={closePublish} />
    </MotionConfig>
  )
}

// Tarjetas grises de distintas alturas mientras llegan las publicaciones
function FeedSkeleton() {
  return (
    <div aria-hidden className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
      {[0.75, 1, 0.67, 0.8, 1, 0.75, 0.67, 0.8].map((aspect, index) => (
        <div key={index} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border bg-card sm:mb-4">
          <div className="animate-pulse bg-muted" style={{ aspectRatio: aspect }} />
          <div className="flex items-center gap-2 p-2.5">
            <div className="size-6 animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
