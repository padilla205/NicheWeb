import { Clock3, Flame, Heart, MessageCircle } from 'lucide-react'
import type { Post } from '@/lib/feed'
import { PostPhoto } from './PostPhoto'

// Fila delgada de circulos, tipo historias, con las publicaciones con mas likes y comentarios.
// Se renueva cada hora; al tocar una se abre completa. En escritorio son tarjetas que llenan la fila,
// con el titulo a la izquierda
type FeaturedPostsProps = {
  featured: Post[]
  secondsRemaining: number
  onOpen: (id: string) => void
}

export function FeaturedPosts({ featured, secondsRemaining, onOpen }: FeaturedPostsProps) {
  const minutes = String(Math.floor(secondsRemaining / 60)).padStart(2, '0')
  const seconds = String(secondsRemaining % 60).padStart(2, '0')
  if (featured.length === 0) return null

  return (
    <section
      aria-labelledby="featured-title"
      className="mb-4 lg:mb-0 lg:flex lg:items-center lg:gap-6"
    >
      <div className="mb-2 flex items-center gap-3 text-sm lg:mb-0 lg:shrink-0 lg:flex-col lg:items-start lg:gap-1">
        <h2 id="featured-title" className="flex items-center gap-1.5 font-medium">
          <Flame aria-hidden="true" className="size-4 text-editorial" />
          Destacados
        </h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-3.5" />
          Se renuevan en
          <span
            role="timer"
            aria-label={`Se renuevan en ${minutes} minutos y ${seconds} segundos`}
            className="font-medium text-foreground tabular-nums"
          >
            {minutes}:{seconds}
          </span>
        </span>
      </div>
      <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:grid lg:flex-1 lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0">
        {featured.map((post, index) => (
          <li key={post.id} className="shrink-0 lg:min-w-0">
            <FeaturedCircle post={post} rank={index + 1} onOpen={() => onOpen(post.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function FeaturedCircle({ post, rank, onOpen }: { post: Post; rank: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ver publicacion de ${post.author.username}, lugar ${rank} en destacados`}
      className="group flex w-18 flex-col items-center gap-1.5 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:w-full lg:flex-row lg:gap-3 lg:rounded-2xl lg:border lg:bg-card lg:p-2.5 lg:text-left"
    >
      {/* Aro de color como el de las historias, con el lugar en la esquina */}
      <span className="relative rounded-full bg-editorial p-0.5">
        <span className="relative flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted">
          <PostPhoto post={post} iconClassName="size-6" />
        </span>
        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-editorial text-[10px] font-semibold text-editorial-foreground tabular-nums">
          {rank}
        </span>
      </span>
      <span className="w-full min-w-0 lg:flex-1">
        <span className="block truncate text-xs group-hover:underline lg:text-sm lg:font-medium">{post.author.username}</span>
        {/* En escritorio hay lugar para los numeros que la hicieron destacar */}
        <span className="hidden items-center gap-3 text-xs text-muted-foreground tabular-nums lg:flex">
          <span className="flex items-center gap-1">
            <Heart aria-hidden="true" className="size-3.5" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle aria-hidden="true" className="size-3.5" />
            {post.commentCount}
          </span>
        </span>
      </span>
    </button>
  )
}
