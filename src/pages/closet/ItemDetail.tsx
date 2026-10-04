import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { type ClosetItem, getColorInfo, getSeasonLabel, getTypeInfo } from '@/lib/clothing'
import { getTeamLabel } from '@/lib/teams'
import { PhotoCarousel } from './PhotoCarousel'

type ItemDetailProps = {
  item: ClosetItem
  onClose: () => void
}

export function ItemDetail({ item, onClose }: ItemDetailProps) {
  // Cada vez que se abre una prenda empieza en la portada
  const [photoIndex, setPhotoIndex] = useState(0)
  const { label: typeLabel, zoneLabel } = getTypeInfo(item.type)
  const title = item.name || typeLabel

  useModalBehavior(onClose)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* layoutCrossfade={false}: al abrir, el detalle se ve solido desde el primer instante.
            Si se mezclara con la tarjeta (que ya esta oculta) se veria transparente y parpadearia */}
        <motion.div
          layoutId={`item-${item.id}`}
          layoutCrossfade={false}
          role="dialog"
          aria-modal
          aria-labelledby="item-detail-title"
          style={{ borderRadius: 16 }}
          className="pointer-events-auto relative grid max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto border bg-popover text-popover-foreground md:grid-cols-2"
        >
          <PhotoCarousel
            itemId={item.id}
            photos={item.photoUrls}
            index={photoIndex}
            onIndexChange={setPhotoIndex}
            alt={title}
            className="aspect-square w-full md:aspect-auto md:h-full md:min-h-96"
          />

          {/* La informacion aparece un instante despues de que la tarjeta se abre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex flex-col gap-5 p-6"
          >
            <div className="pr-8">
              <h2 id="item-detail-title" className="text-xl font-semibold tracking-tight">
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.name ? `${typeLabel} - ${zoneLabel}` : zoneLabel}
              </p>
            </div>

            {item.team && (
              <DetailSection title="Equipo">
                <p className="text-sm">{getTeamLabel(item.team)}</p>
              </DetailSection>
            )}

            <DetailSection title="Temporada">
              {item.seasons.length === 0 ? (
                <EmptyValue />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {item.seasons.map((season) => (
                    <span key={season} className="rounded-full bg-muted px-3 py-1 text-sm">
                      {getSeasonLabel(season)}
                    </span>
                  ))}
                </div>
              )}
            </DetailSection>

            <DetailSection title="Colores">
              {item.colors.length === 0 ? (
                <EmptyValue />
              ) : (
                <div className="flex flex-wrap gap-3">
                  {item.colors.map((color) => {
                    const { label, hex } = getColorInfo(color)
                    return (
                      <span key={color} className="flex items-center gap-2 text-sm">
                        <span className="size-5 rounded-full border" style={{ backgroundColor: hex }} />
                        {label}
                      </span>
                    )
                  })}
                </div>
              )}
            </DetailSection>

            <DetailSection title="Agregada">
              <p className="text-sm">
                {item.createdAt.toLocaleDateString('es-MX', { dateStyle: 'long' })}
              </p>
            </DetailSection>
          </motion.div>

          <Button
            variant="secondary"
            size="icon-sm"
            onClick={onClose}
            autoFocus
            className="absolute top-3 right-3"
          >
            <X />
            <span className="sr-only">Cerrar</span>
          </Button>
        </motion.div>
      </div>
    </>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}

function EmptyValue() {
  return <p className="text-sm text-muted-foreground">Sin especificar</p>
}
