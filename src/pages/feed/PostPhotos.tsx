import { useState } from 'react'
import type { Post } from '@/lib/feed'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'
import { PostPhoto } from './PostPhoto'

type PostPhotosProps = {
  post: Post
  // Distinto en el feed y en el perfil para que sus animaciones no se mezclen
  carouselId: string
  iconClassName: string
}

// Fotos de una publicacion en grande: completas segun sus proporciones y con flechas si son varias
export function PostPhotos({ post, carouselId, iconClassName }: PostPhotosProps) {
  // Cada vez que se muestra empieza en la portada
  const [index, setIndex] = useState(0)
  if (post.photoUrls.length === 0) return <PostPhoto post={post} iconClassName={iconClassName} />

  return (
    <PhotoCarousel
      itemId={carouselId}
      photos={post.photoUrls}
      index={index}
      onIndexChange={setIndex}
      alt={post.caption || `Publicacion de ${post.author.username}`}
      fit="contain"
      className="absolute inset-0 bg-muted"
    />
  )
}
