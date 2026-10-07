import { Maximize2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Listing } from '@/lib/marketplace'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'
import { ListingPhoto } from './ListingPhoto'

const photoButtonClass = 'size-10 rounded-full bg-background/85 text-foreground shadow-sm hover:bg-background'

export function ListingGallery({ listing }: { listing: Listing }) {
  const [index, setIndex] = useState(0)

  if (listing.photoUrls.length === 0) {
    return <ListingPhoto listing={listing} className="rounded-2xl border" iconClassName="size-20" />
  }

  return (
    <Dialog>
      <PhotoCarousel
        itemId={`listing-${listing.id}`}
        photos={listing.photoUrls}
        index={index}
        onIndexChange={setIndex}
        alt={listing.title}
        animation="cards"
        className="aspect-square w-full overflow-hidden rounded-2xl border bg-muted"
        topRightControl={
          <DialogTrigger asChild>
            <Button variant="secondary" size="icon" className={photoButtonClass} aria-label="Ver prenda en pantalla completa">
              <Maximize2 aria-hidden="true" />
            </Button>
          </DialogTrigger>
        }
      />
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="h-dvh max-w-none gap-0 overflow-hidden rounded-none bg-black p-0 ring-0 duration-200 sm:max-w-none motion-reduce:animate-none"
      >
        <DialogTitle className="sr-only">Fotos de {listing.title}</DialogTitle>
        <PhotoCarousel
          itemId={`listing-fullscreen-${listing.id}`}
          photos={listing.photoUrls}
          index={index}
          onIndexChange={setIndex}
          alt={listing.title}
          animation="cards"
          fit="contain"
          className="size-full min-h-0"
          topRightControl={
            <DialogClose asChild>
              <Button variant="secondary" size="icon" className={photoButtonClass} aria-label="Cerrar pantalla completa">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
