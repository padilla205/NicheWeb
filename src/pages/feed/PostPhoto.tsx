import { Shirt } from 'lucide-react'
import type { Post } from '@/lib/feed'

// Miniatura de una publicacion: su portada recortada al cuadro, o el icono sobre el degradado si no tiene fotos
export function PostPhoto({ post, iconClassName }: { post: Post; iconClassName: string }) {
  const cover = post.photoUrls[0]
  if (!cover) return <Shirt className={`${iconClassName} text-white/70`} strokeWidth={1.5} aria-hidden />
  return <img src={cover} alt={post.caption} loading="lazy" className="absolute inset-0 size-full object-cover" />
}
