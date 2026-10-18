import { Shirt } from 'lucide-react'
import type { Post } from '@/lib/feed'

// Contenido del cuadro de una publicacion: su foto, o el icono sobre el degradado si no tiene
export function PostPhoto({ post, iconClassName }: { post: Post; iconClassName: string }) {
  if (post.photoUrl) {
    return (
      <img
        src={post.photoUrl}
        alt={post.caption}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
    )
  }
  return <Shirt className={`${iconClassName} text-white/70`} strokeWidth={1.5} aria-hidden />
}
