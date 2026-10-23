import { Heart, MessageCircle } from 'lucide-react'
import { type MouseEvent, type PointerEvent, useRef } from 'react'
import { useToggleLike } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { PostPhotos } from './PostPhotos'
import { AuthorMenu } from './AuthorMenu'

// Pixeles que se puede mover el dedo y que aun cuente como toque (no como deslizar las fotos)
const TAP_SLOP = 10

type FeedCardProps = {
  post: Post
  onOpen: () => void
  // Despues de "No me interesa" en el menu del autor
  onAuthorHidden: () => void
}

// Publicacion en la cuadricula: la foto con su forma, y abajo el autor, likes y comentarios
export function FeedCard({ post, onOpen, onAuthorHidden }: FeedCardProps) {
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

  return (
    <article className="mb-3 break-inside-avoid sm:mb-4 overflow-hidden rounded-2xl border bg-card">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver publicacion de ${post.author.username}`}
        onPointerDown={onPointerDown}
        onClick={onPhotoClick}
        onKeyDown={(event) => event.key === 'Enter' && onOpen()}
        className="relative flex cursor-pointer items-center justify-center bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{ aspectRatio: post.aspect }}
      >
        <PostPhotos post={post} carouselId={`feed-${post.id}`} iconClassName="size-10" fit="cover" />
      </div>
      {/* En celular la tarjeta es angosta: el autor va en su propio renglon y los contadores abajo */}
      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 p-2.5 text-sm">
        <AuthorMenu
          post={post}
          onHidden={onAuthorHidden}
          className="basis-full sm:flex-1 sm:basis-0"
          avatarClassName="size-6 text-[10px]"
        />
        <button
          type="button"
          onClick={() => toggleLike(post)}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
          className="touch-target relative flex items-center gap-1 text-muted-foreground tabular-nums hover:text-foreground"
        >
          <Heart className={cn('size-4', post.likedByMe && 'fill-red-500 text-red-500')} />
          {post.likes}
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label="Ver comentarios"
          className="touch-target relative flex items-center gap-1 text-muted-foreground tabular-nums hover:text-foreground"
        >
          <MessageCircle className="size-4" />
          {post.commentCount}
        </button>
      </footer>
    </article>
  )
}
