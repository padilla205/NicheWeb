import { Heart, Shirt } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { useToggleLike, useToggleShare } from '@/hooks/usePosts'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { CommentsDialog } from './CommentsDialog'
import { PostActions } from './PostActions'
import { UserAvatar } from './UserAvatar'

// Cada parte de la publicacion es un bloque redondeado aparte
const blockClass = 'rounded-2xl border bg-card'

export function PostCard({ post }: { post: Post }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  // Cuenta los dobles clics para mostrar el corazon grande sobre la foto cada vez
  const [burst, setBurst] = useState(0)
  const toggleLike = useToggleLike()
  const toggleShare = useToggleShare()
  const count = post.comments.length
  // Funcion estable: si cambiara en cada render, el cuadro de comentarios perderia el foco al comentar
  const closeComments = useCallback(() => setCommentsOpen(false), [])
  const openComments = () => setCommentsOpen(true)

  // Doble clic en la foto: solo da like (nunca lo quita), como en otras redes
  function likeFromPhoto() {
    if (!post.likedByMe) toggleLike(post.id)
    setBurst((n) => n + 1)
  }

  return (
    <article className="flex flex-col gap-1.5">
      <header className={cn(blockClass, 'flex items-center gap-3 p-3')}>
        <UserAvatar user={post.author} />
        <div className="min-w-0 text-sm">
          <span className="font-medium">{post.author.username}</span>
          <span className="text-muted-foreground"> · {formatTimeAgo(post.createdAt)}</span>
        </div>
      </header>

      {/* Foto, likes, compartir y comentarios van en un solo cuadro, separados por lineas.
          overflow-hidden recorta la foto con las esquinas redondeadas del cuadro */}
      <div className={cn(blockClass, 'divide-y overflow-hidden')}>
        <div
          onDoubleClick={likeFromPhoto}
          className="relative flex aspect-[4/5] items-center justify-center select-none"
          style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
        >
          <Shirt className="size-16 text-white/70" strokeWidth={1.5} />
          <AnimatePresence>
            {burst > 0 && (
              <motion.span
                key={burst}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onAnimationComplete={() => setBurst(0)}
                className="absolute"
              >
                <Heart className="size-24 fill-white text-white drop-shadow-lg" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="p-2.5">
          <PostActions
            post={post}
            onLike={() => toggleLike(post.id)}
            onComment={openComments}
            onShareToProfile={() => toggleShare(post.id)}
          />
        </div>
        <div className="flex flex-col items-start gap-1.5 p-3 text-sm">
          <p>
            <span className="font-medium">{post.author.username}</span> {post.caption}
          </p>
          <button
            type="button"
            onClick={openComments}
            className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {count === 0
              ? 'Escribe el primer comentario'
              : count === 1
                ? 'Ver el comentario'
                : `Ver los ${count} comentarios`}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {commentsOpen && <CommentsDialog post={post} onClose={closeComments} />}
      </AnimatePresence>
    </article>
  )
}
