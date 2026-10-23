import { useState } from 'react'
import { FullscreenPhotos } from '@/components/FullscreenPhotos'
import type { Listing } from '@/lib/marketplace'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'
import { ListingPhoto } from './ListingPhoto'

export function ListingGallery({ listing }: { listing: Listing }) {
  const [index, setIndex] = useState(0)

  if (listing.photoUrls.length === 0) {
    return <ListingPhoto listing={listing} className="rounded-2xl border" iconClassName="size-20" />
  }

  return (
    <PhotoCarousel
      itemId={`listing-${listing.id}`}
      photos={listing.photoUrls}
      placeholder={listing.thumbUrl}
      index={index}
      onIndexChange={setIndex}
      alt={listing.title}
      animation="cards"
      className="aspect-square w-full overflow-hidden rounded-2xl border bg-muted"
      topRightControl={
        <FullscreenPhotos
          itemId={`listing-${listing.id}`}
          photos={listing.photoUrls}
          index={index}
          onIndexChange={setIndex}
          alt={listing.title}
        />
      }
    />
  )
}
