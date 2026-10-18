import { Shirt } from 'lucide-react'
import type { Post } from '@/lib/feed'
import { EmptyTab } from './EmptyTab'

// Cuadricula de publicaciones del perfil (las tuyas o las que compartiste)
export function PostGrid({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  if (posts.length === 0) return <EmptyTab>{emptyText}</EmptyTab>

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
          style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
        >
          <Shirt
            className="absolute inset-0 m-auto size-10 text-white/70"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="relative w-full truncate bg-gradient-to-t from-black/50 to-transparent px-3 pt-6 pb-2 text-xs text-white">
            <span className="font-medium">{post.author.username}</span> {post.caption}
          </p>
        </li>
      ))}
    </ul>
  )
}
