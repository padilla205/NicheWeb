import { EyeOff, Plus, Users } from 'lucide-react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { Button } from '@/components/ui/button'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import { useFeaturedPosts, useFeed, useToggleHiddenAuthor } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'
import { cascade, crossfade } from '@/lib/motion'
import { mobileHeroClass, mobileSheetClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
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
  // Si se abrio desde su tarjeta crece desde ahi; desde Destacados solo aparece
  const [fromCard, setFromCard] = useState(false)
  // Al cerrar, la tarjeta se vuelve a crear sin enlace con la ventana: la ventana desaparece al
  // instante en vez de regresar a la tarjeta (igual que en el perfil)
  const [closingId, setClosingId] = useState<string | null>(null)
  // Cada apertura crea una ventana nueva, aunque la anterior aun se este quitando
  const [openCount, setOpenCount] = useState(0)

  function openPost(id: string, card: boolean) {
    setClosingId(null)
    setFromCard(card)
    setOpenId(id)
    setOpenCount((count) => count + 1)
  }
  const closePost = useCallback(() => (fromCard ? setClosingId(openId) : setOpenId(null)), [fromCard, openId])
  // Paso 2 del cierre (en el siguiente cuadro): ya sin enlace, se quita la ventana
  useEffect(() => {
    if (!closingId || closingId !== openId) return
    const frame = requestAnimationFrame(() => setOpenId(null))
    return () => cancelAnimationFrame(frame)
  }, [closingId, openId])
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
  const opened = [...feed.posts, ...featured].find((post) => post.id === openId)

  function toggleSeason(season: Season) {
    setSelectedSeasons((current) =>
      current.includes(season) ? current.filter((s) => s !== season) : [...current, season],
    )
  }

  return (
    // Si el sistema pide menos movimiento, las animaciones del feed se reducen
    <MotionConfig reducedMotion="user">
      {/* Celular: cabecera negra con el titulo y Destacados; crear se hace con el + de la barra */}
      <div className={mobileHeroClass}>
        <h1 className="text-[28px] font-semibold tracking-tight">Feed</h1>
        <p className="mb-5 text-sm text-muted-foreground">Outfits de la comunidad</p>
        <FeaturedPosts featured={featured} secondsRemaining={secondsRemaining} onOpen={(id) => openPost(id, false)} />
      </div>
      {/* Sin ancho maximo: en pantallas grandes las columnas llenan el espacio en vez de dejar orillas
          vacias. En celular es la hoja que sube sobre la cabecera negra */}
      <div className={mobileSheetClass}>
        {/* Encabezado. En celular solo quedan los filtros (lo demas va en la cabecera negra). En
            escritorio los filtros suben a la fila del titulo y Destacados ocupa todo el ancho abajo,
            sin huecos */}
        <div className="mb-4 grid grid-cols-[1fr_auto] items-start gap-x-3 [grid-template-areas:'title_create''featured_featured''filters_filters'] lg:mb-5 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-x-6 lg:gap-y-5 lg:[grid-template-areas:'title_filters_create''featured_featured_featured']">
          <PageTitle title="Feed" className="[grid-area:title] max-md:hidden lg:mb-0" />
          <div className="[grid-area:create] max-md:hidden">
            <MorphButton hidden={publishOrigin !== null} onOpen={setPublishOrigin}>
              <Plus />
              Crear publicacion
            </MorphButton>
          </div>
          <div className="min-w-0 [grid-area:featured] max-md:hidden">
            <FeaturedPosts featured={featured} secondsRemaining={secondsRemaining} onOpen={(id) => openPost(id, false)} />
          </div>

          {/* En celular las pastillas se deslizan de lado en una sola fila */}
          <div className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 [grid-area:filters] sm:mx-0 sm:flex-wrap sm:px-0 lg:pb-0">
            <ChoicePill slideId="feed-tab" active={tab === 'for-you'} onClick={() => setTab('for-you')}>
              Para ti
            </ChoicePill>
            <ChoicePill slideId="feed-tab" active={tab === 'following'} onClick={() => setTab('following')}>
              Siguiendo
            </ChoicePill>
            <span aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-border" />
            {seasons.map(({ value, label }) => (
              <ChoicePill key={value} active={selectedSeasons.includes(value)} onClick={() => toggleSeason(value)}>
                {label}
              </ChoicePill>
            ))}
          </div>
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
          {/* El skeleton se desvanece hacia el contenido en vez de cambiar de golpe */}
          <AnimatePresence mode="wait" initial={false}>
            {feed.isPending ? (
              <motion.div key="cargando" {...crossfade}>
                <FeedSkeleton />
              </motion.div>
            ) : feed.posts.length === 0 ? (
              <motion.div key="vacio" {...crossfade}>
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
              </motion.div>
            ) : (
              // ponytail: columnas de CSS (tipo Pinterest); el orden va de arriba hacia abajo por columna
              <motion.div key="publicaciones" {...crossfade} className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5 2xl:columns-6">
                {feed.posts.map((post, index) => (
                  // Aparecen en cascada; mientras su publicacion esta abierta, la tarjeta se esconde
                  <motion.div key={post.id} {...cascade(index)} className="mb-3 break-inside-avoid sm:mb-4">
                    <div className={cn(fromCard && openId === post.id && 'pointer-events-none opacity-0')}>
                      <FeedCard
                        key={post.id === closingId ? `${post.id}-cerrando` : post.id}
                        post={post}
                        layoutId={post.id === closingId ? undefined : `profile-post-${post.id}`}
                        onOpen={() => openPost(post.id, true)}
                        onAuthorHidden={() => onAuthorHidden(post)}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <ShowMore shown={feed.posts.length} total={feed.total} onClick={feed.loadMore} />
        </div>
      </div>
      <AnimatePresence>
        {opened && (
          <PostDetail
            key={`${opened.id}-${openCount}`}
            post={opened}
            morph={fromCard}
            onClose={closePost}
            onAuthorHidden={() => onAuthorHidden(opened)}
          />
        )}
      </AnimatePresence>
      <PublishPostDialog origin={publishOrigin} onClose={closePublish} />
    </MotionConfig>
  )
}

// Tarjetas grises de distintas alturas mientras llegan las publicaciones
function FeedSkeleton() {
  return (
    <div aria-hidden className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5 2xl:columns-6">
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
