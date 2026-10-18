import { Shirt } from 'lucide-react'
import type { Post } from '@/lib/feed'

type PostPhotoProps = {
  post: Post
  iconClassName: string
  // "contain" muestra la foto completa segun sus proporciones (vistas grandes); "cover" llena el cuadro recortando (miniaturas)
  fit?: 'cover' | 'contain'
}

// Contenido del cuadro de una publicacion: su foto, o el icono sobre el degradado si no tiene
export function PostPhoto({ post, iconClassName, fit = 'cover' }: PostPhotoProps) {
  if (!post.photoUrl) {
    return <Shirt className={`${iconClassName} text-white/70`} strokeWidth={1.5} aria-hidden />
  }
  if (fit === 'cover') {
    return (
      <img
        src={post.photoUrl}
        alt={post.caption}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
    )
  }
  // Fondo neutro en los espacios que quedan a los lados o arriba y abajo de la foto
  return (
    <div className="absolute inset-0 bg-muted">
      <img src={post.photoUrl} alt={post.caption} loading="lazy" className="size-full object-contain" />
    </div>
  )
}
