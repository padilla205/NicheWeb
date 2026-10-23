import { Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'

const photoButtonClass = 'size-10 rounded-full bg-background/85 text-foreground shadow-sm hover:bg-background'

type FullscreenPhotosProps = {
  // Distinto al del carrusel normal para que sus animaciones no se mezclen
  itemId: string
  photos: string[]
  index: number
  onIndexChange: (index: number) => void
  alt: string
}

// Boton para ver las fotos en pantalla completa, con zoom; va en la esquina del carrusel
export function FullscreenPhotos({ itemId, photos, index, onIndexChange, alt }: FullscreenPhotosProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className={photoButtonClass} aria-label="Ver en pantalla completa">
          <Maximize2 aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="h-dvh max-w-none gap-0 overflow-hidden rounded-none bg-black p-0 ring-0 duration-200 sm:max-w-none motion-reduce:animate-none"
      >
        <DialogTitle className="sr-only">Fotos de {alt}</DialogTitle>
        <PhotoCarousel
          itemId={`fullscreen-${itemId}`}
          photos={photos}
          index={index}
          onIndexChange={onIndexChange}
          alt={alt}
          animation="cards"
          fit="contain"
          zoomable
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
