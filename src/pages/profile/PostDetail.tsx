import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { SwipeHandle } from '@/components/SwipeHandle'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useSwipeToClose } from '@/hooks/useSwipeToClose'
import { useToggleLike, useToggleShare } from '@/hooks/usePosts'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { CommentsThread } from '@/pages/feed/CommentsDialog'
import { PostActions } from '@/pages/feed/PostActions'
import { PostPhotos } from '@/pages/feed/PostPhotos'
import { UserAvatar } from '@/pages/feed/UserAvatar'

// El cierre dura lo mismo para el fondo oscuro y para la ventana
const CLOSE_SECONDS = 0.15

type PostDetailProps = {
  post: Post
  onClose: () => void
}

// Publicacion completa: foto, autor, descripcion, likes y comentarios
export function PostDetail({ post, onClose }: PostDetailProps) {
  // Se decide una sola vez al abrir: en el celular el cuadro de comentario no se enfoca solo
  // para que el teclado no tape la publicacion
  const [isDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const toggleLike = useToggleLike()
  const toggleShare = useToggleShare()

  useModalBehavior(onClose)
  const swipe = useSwipeToClose(onClose)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: CLOSE_SECONDS } }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        // Solo oscurece el fondo, sin desenfocarlo
        className="fixed inset-0 z-50 bg-black/40"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* layoutCrossfade={false}: se ve solido desde el primer instante, sin parpadear */}
        <motion.div
          layoutId={`profile-post-${post.id}`}
          layoutCrossfade={false}
          // Al cerrar, la ventana y su foto se desvanecen juntas donde estan, al ritmo del fondo
          exit={{ opacity: 0, transition: { duration: CLOSE_SECONDS } }}
          {...swipe.panelProps}
          role="dialog"
          aria-modal
          aria-label={`Publicacion de ${post.author.username}`}
          style={{ borderRadius: 16 }}
          className="pointer-events-auto relative flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-y-auto border bg-popover text-popover-foreground md:h-[min(85dvh,640px)] md:flex-row md:overflow-hidden"
        >
          <SwipeHandle onPointerDown={swipe.startDrag} />
          <motion.div
            layoutId={`profile-post-photo-${post.id}`}
            className="relative flex aspect-[4/5] shrink-0 items-center justify-center md:aspect-auto md:h-full md:w-1/2"
            style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
          >
            <PostPhotos post={post} carouselId={`profile-post-detail-${post.id}`} iconClassName="size-16" />
          </motion.div>

          {/* "layout" dibuja el texto nitido y a su tamano real mientras la ventana crece y lo va
              descubriendo (sin desvanecerse ni "letras mini"); al cerrar se va rapido */}
          <motion.div
            layout
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex shrink-0 flex-col md:min-h-0 md:flex-1 md:shrink md:border-l"
          >
            <header className="flex items-center gap-3 border-b p-3 pr-14">
              <UserAvatar user={post.author} />
              <div className="min-w-0 text-sm">
                <span className="font-medium">{post.author.username}</span>
                <span className="text-muted-foreground"> · {formatTimeAgo(post.createdAt)}</span>
              </div>
            </header>

            {post.caption && (
              <p className="border-b p-4 text-sm">
                <span className="font-medium">{post.author.username}</span> {post.caption}
              </p>
            )}

            <div className="border-b p-2.5">
              {/* El boton de comentar lleva al cuadro de texto de abajo */}
              <PostActions
                post={post}
                onLike={() => toggleLike(post.id)}
                onComment={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
                onShareToProfile={() => toggleShare(post.id)}
              />
            </div>

            <CommentsThread post={post} autoFocus={isDesktop} />
          </motion.div>

          <motion.div
            layout
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="absolute top-2 right-2"
          >
            <Button variant="secondary" size="icon-sm" onClick={onClose}>
              <X />
              <span className="sr-only">Cerrar</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
