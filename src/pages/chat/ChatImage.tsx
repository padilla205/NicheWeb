import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PhotoCarousel } from '@/pages/closet/PhotoCarousel'

type ChatImageProps = {
  id: string
  imageUrl: string
  thumbUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Foto o GIF de un mensaje en pantalla completa, con zoom
export function ChatImage({ id, imageUrl, thumbUrl, open, onOpenChange }: ChatImageProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
