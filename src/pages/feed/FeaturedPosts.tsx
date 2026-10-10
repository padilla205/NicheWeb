import { Clock3, Flame, Heart, MessageCircle, Shirt } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useFeaturedPosts } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'

// Fila de tarjetas con las publicaciones con mas likes y comentarios.
// En el celular se desliza de lado; en escritorio caben las cuatro
export function FeaturedPosts() {
  const { featured, refreshAt, secondsRemaining } = useFeaturedPosts()
  const reducedMotion = useReducedMotion()
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')
  if (featured.length === 0) return null

  return (
    <section aria-labelledby="featured-title" className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="featured-title" className="flex items-center gap-1.5 text-sm font-medium">
          <Flame aria-hidden="true" className="size-4 text-orange-500" />
          Destacados
        </h2>
        <div className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5" />
          <span>Se renuevan en</span>
          <span
            role="timer"
            aria-label={`Se renuevan en ${minutes} minutos y ${seconds} segundos`}
            className="font-medium text-foreground tabular-nums"
          >
            {minutes}:{seconds}
          </span>
        </div>
      </div>
      <div aria-hidden="true" className="mb-3 h-0.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={false}
          animate={{ scaleX: secondsRemaining / 3600 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'linear' }}
          className="h-full origin-left rounded-full bg-orange-500/60"
        />
      </div>
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
        <AnimatePresence mode="popLayout">
          {featured.map((post, index) => (
            <motion.li
              key={`${refreshAt}-${post.id}`}
              layout
              initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
              className="w-32 shrink-0 snap-start sm:w-auto"
            >
              <FeaturedCard post={post} rank={index + 1} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}

function FeaturedCard({ post, rank }: { post: Post; rank: number }) {
  // Lleva a la publicacion completa dentro del feed
  function goToPost() {
    document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={goToPost}
      aria-label={`Ver publicacion de ${post.author.username}, lugar ${rank} en destacados`}
      className="group block w-full overflow-hidden rounded-2xl border bg-card text-left transition-transform duration-150 active:scale-[0.97]"
    >
      <div
        className="relative flex aspect-square items-center justify-center"
        style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
      >
        <Shirt className="size-8 text-white/70" strokeWidth={1.5} />
        <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-black/40 text-xs font-semibold text-white tabular-nums backdrop-blur-sm">
          {rank}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-2.5 text-xs">
        <span className="truncate font-medium group-hover:underline">{post.author.username}</span>
        <span className="flex items-center gap-2.5 text-muted-foreground tabular-nums">
          <span className="flex items-center gap-1">
            <Heart className="size-3.5" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            {post.comments.length}
          </span>
        </span>
      </div>
    </button>
  )
}
