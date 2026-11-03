import { Heart, MessageCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { type MouseEvent, type PointerEvent, useRef } from 'react'
import { useToggleLike } from '@/hooks/usePosts'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { hoverLift } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { RollingNumber } from '@/components/RollingNumber'
import { PostPhotos } from './PostPhotos'
import { AuthorMenu } from './AuthorMenu'

// Pixeles que se puede mover el dedo y que aun cuente como toque (no como deslizar las fotos)
const TAP_SLOP = 10

type FeedCardProps = {
  post: Post
  onOpen: () => void
  // Despues de "No me interesa" en el menu del autor
  onAuthorHidden: () => void
  // Con el mismo nombre que la publicacion abierta, la tarjeta crece hasta abrirse
  layoutId?: string
}

// Publicacion en la cuadricula: la foto con su forma y, encima, el autor, el texto, likes y comentarios
export function FeedCard({ post, onOpen, onAuthorHidden, layoutId }: FeedCardProps) {
  const toggleLike = useToggleLike()
  const start = useRef({ x: 0, y: 0 })

  function onPointerDown(event: PointerEvent) {
    start.current = { x: event.clientX, y: event.clientY }
  }

  // Abre la publicacion solo con un toque: no al deslizar las fotos ni al usar sus flechas
  function onPhotoClick(event: MouseEvent) {
    const moved = Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y)
    if (moved > TAP_SLOP || (event.target as HTMLElement).closest('button')) return
    onOpen()
  }

  const actionClass =
    'touch-target pointer-events-auto relative flex items-center gap-1 tabular-nums text-white/85 transition-colors hover:text-white'

  return (
    // Tarjeta de contenido: la foto ocupa toda la tarjeta, el autor va arriba y el texto abajo,
    // encima de la imagen con un degradado oscuro para que se lea; con el mouse se oscurece un poco
    <motion.article
      layoutId={layoutId}
      style={{ borderRadius: 24 }}
      className={cn('group relative overflow-hidden bg-card shadow-[0_12px_28px_-16px_rgb(0_0_0/0.35)]', hoverLift)}
    >
      <motion.div
        layoutId={layoutId && `${layoutId}-photo`}
        role="button"
        tabIndex={0}
        aria-label={`Ver publicacion de ${post.author.username}`}
        onPointerDown={onPointerDown}
        onClick={onPhotoClick}
        onKeyDown={(event) => event.key === 'Enter' && onOpen()}
        className="relative flex min-h-56 cursor-pointer items-center justify-center bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{ aspectRatio: post.aspect }}
      >
        <PostPhotos post={post} carouselId={`feed-${post.id}`} iconClassName="size-10" fit="cover" />
      </motion.div>

      {/* Degradados arriba y abajo para que el texto blanco se lea sobre cualquier foto */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5),transparent_30%,transparent_55%,rgb(0_0_0/0.7))]" />
      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

      {/* Arriba: autor y hace cuanto publico */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 p-3 text-white">
        <AuthorMenu
          post={post}
          onHidden={onAuthorHidden}
          className="pointer-events-auto text-sm"
          avatarClassName="size-7 text-[10px] ring-2 ring-white/80"
        />
        <span className="shrink-0 text-xs text-white/70">{formatTimeAgo(post.createdAt)}</span>
      </header>

      {/* Abajo: el texto de la publicacion y los contadores */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 text-white">
        {post.caption && <p className="line-clamp-2 text-sm font-medium text-pretty">{post.caption}</p>}
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => toggleLike(post)}
            aria-pressed={post.likedByMe}
            aria-label={post.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
            className={actionClass}
          >
            {/* Al dar like el corazon da un saltito y el numero sube rodando */}
            <motion.span
              key={String(post.likedByMe)}
              initial={post.likedByMe ? { scale: 0.6 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.5 }}
              className="flex"
            >
              <Heart className={cn('size-4', post.likedByMe && 'fill-red-500 text-red-500')} />
            </motion.span>
            <RollingNumber value={post.likes} />
          </button>
          <button type="button" onClick={onOpen} aria-label="Ver comentarios" className={actionClass}>
            <MessageCircle className="size-4" />
            {post.commentCount}
          </button>
        </div>
      </footer>
    </motion.article>
  )
}
