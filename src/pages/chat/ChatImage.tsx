import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'

type ChatImageProps = {
  id: string
  imageUrl: string
  thumbUrl: string
}

// Foto o GIF de un mensaje: completa segun sus proporciones y, al tocarla, en pantalla completa con zoom
export function ChatImage({ id, imageUrl, thumbUrl }: ChatImageProps) {
  return (
    <Dialog>
      <DialogTrigger className="overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <img src={thumbUrl} alt="Imagen del mensaje" loading="lazy" className="max-h-72 max-w-full object-contain" />
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="h-dvh max-w-none gap-0 overflow-hidden rounded-none bg-black p-0 ring-0 duration-200 sm:max-w-none motion-reduce:animate-none"
      >
        <DialogTitle className="sr-only">Imagen del mensaje</DialogTitle>
        <PhotoCarousel
          itemId={`message-${id}`}
          photos={[imageUrl]}
          placeholder={thumbUrl}
          index={0}
          onIndexChange={() => {}}
          alt="Imagen del mensaje"
          fit="contain"
          zoomable
          className="size-full min-h-0"
          topRightControl={
            <DialogClose asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-10 rounded-full bg-background/85 text-foreground shadow-sm hover:bg-background"
                aria-label="Cerrar imagen"
              >
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
