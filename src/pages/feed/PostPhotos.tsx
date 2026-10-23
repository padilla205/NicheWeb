import { useState } from 'react'
import { OutfitBoard } from '@/components/OutfitBoard'
import type { Post } from '@/lib/feed'
import { piecesOf } from '@/lib/outfits'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'
import { PostPhoto } from './PostPhoto'

type PostPhotosProps = {
  post: Post
  // Distinto en el feed y en el perfil para que sus animaciones no se mezclen
  carouselId: string
  iconClassName: string
  // En la cuadricula del feed la portada llena su cuadro; abierta se ve completa
  fit?: 'cover' | 'contain'
}

// Fotos de una publicacion; si son varias se deslizan con el dedo o con las flechas
export function PostPhotos({ post, carouselId, iconClassName, fit = 'contain' }: PostPhotosProps) {
  // Cada vez que se muestra empieza en la portada
  const [index, setIndex] = useState(0)
  // Publicacion de solo un outfit: se ve el outfit armado
  if (post.photoUrls.length === 0 && post.outfit) {
    // El ancho sale del alto (2/3), asi el outfit completo cabe en cualquier cuadro
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-card">
        <OutfitBoard pieces={piecesOf(post.outfit.items)} compact className="aspect-[2/3] h-full max-w-full content-center" />
      </div>
    )
  }
  if (post.photoUrls.length === 0) return <PostPhoto post={post} iconClassName={iconClassName} />

  return (
    <PhotoCarousel
      itemId={carouselId}
      photos={post.photoUrls}
      index={index}
      onIndexChange={setIndex}
      alt={post.caption || `Publicacion de ${post.author.username}`}
      fit={fit}
      className="absolute inset-0 bg-muted"
    />
  )
}
