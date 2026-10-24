import { Columns2, Images } from 'lucide-react'
import { useState } from 'react'
import { FullscreenPhotos } from '@/components/FullscreenPhotos'
import { ImageCompare } from '@/components/ImageCompare'
import { Button } from '@/components/ui/button'
import type { Listing } from '@/lib/marketplace'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'
import { ListingPhoto } from './ListingPhoto'

export function ListingGallery({ listing }: { listing: Listing }) {
  const [index, setIndex] = useState(0)
  const [comparing, setComparing] = useState(false)
  const photos = listing.photoUrls

  if (photos.length === 0) {
    return <ListingPhoto listing={listing} className="rounded-2xl border" iconClassName="size-20" />
  }

  const frame = 'aspect-square w-full overflow-hidden rounded-2xl border bg-muted'
  // Se compara la foto actual con la siguiente (o con la anterior si es la ultima)
  const first = Math.min(index, photos.length - 2)

  return (
    <div className="flex flex-col gap-2">
      {comparing ? (
        <ImageCompare
          before={photos[first]}
          after={photos[first + 1]}
          beforeLabel={`Foto ${first + 1}`}
          afterLabel={`Foto ${first + 2}`}
          className={frame}
        />
      ) : (
        <PhotoCarousel
          itemId={`listing-${listing.id}`}
          photos={photos}
          placeholder={listing.thumbUrl}
          index={index}
          onIndexChange={setIndex}
          alt={listing.title}
          animation="cards"
          className={frame}
          topRightControl={
            <FullscreenPhotos
              itemId={`listing-${listing.id}`}
              photos={photos}
              index={index}
              onIndexChange={setIndex}
              alt={listing.title}
            />
          }
        />
      )}
      {photos.length > 1 && (
        <Button variant="outline" size="sm" className="self-start" aria-pressed={comparing} onClick={() => setComparing(!comparing)}>
          {comparing ? <Images /> : <Columns2 />}
          {comparing ? 'Ver fotos' : 'Comparar fotos'}
        </Button>
      )}
    </div>
  )
}
