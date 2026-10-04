import { Heart, Shirt } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useToggleLike } from '@/hooks/usePosts'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { PostActions } from './PostActions'
import { PostComments } from './PostComments'
import { UserAvatar } from './UserAvatar'

export function PostCard({ post }: { post: Post }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  // Cuenta los dobles clics para mostrar el corazon grande sobre la foto cada vez
  const [burst, setBurst] = useState(0)
  const toggleLike = useToggleLike()

  // Doble clic en la foto: solo da like (nunca lo quita), como en otras redes
  function likeFromPhoto() {
    if (!post.likedByMe) toggleLike(post.id)
    setBurst((n) => n + 1)
  }

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-3 p-3">
        <UserAvatar user={post.author} />
        <div className="min-w-0 text-sm">
          <span className="font-medium">{post.author.username}</span>
          <span className="text-muted-foreground"> · {formatTimeAgo(post.createdAt)}</span>
        </div>
      </header>

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

      <div className="flex flex-col gap-2 p-3">
        <PostActions
          post={post}
          onLike={() => toggleLike(post.id)}
          onComment={() => setCommentsOpen((open) => !open)}
        />
        <p className="text-sm">
          <span className="font-medium">{post.author.username}</span> {post.caption}
        </p>
        <PostComments post={post} open={commentsOpen} onOpen={() => setCommentsOpen(true)} />
      </div>
    </article>
  )
}
