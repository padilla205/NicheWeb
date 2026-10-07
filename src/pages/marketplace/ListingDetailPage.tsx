import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react'
import { type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { useListing } from '@/hooks/useListings'
import { getColorInfo, getSeasonLabel, getTypeInfo } from '@/lib/clothing'
import { formatTimeAgo } from '@/lib/feed'
import { formatPrice, getConditionLabel } from '@/lib/marketplace'
import { formatLocation } from '@/lib/locations'
import { getTeamLabel } from '@/lib/teams'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { ListingGallery } from './ListingGallery'

export function ListingDetailPage() {
  const { id } = useParams()
  const listing = useListing(id)

  return (
    <div className="mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
        <Link to="/marketplace">
          <ArrowLeft />
          Volver al marketplace
        </Link>
      </Button>

      {!listing ? (
        <p className="py-20 text-center text-sm text-muted-foreground">Esta venta ya no existe.</p>
      ) : (
        // En escritorio la foto va a la izquierda y la informacion a la derecha; en celular una abajo de otra
        <article className="grid gap-6 md:grid-cols-2">
          <ListingGallery key={listing.id} listing={listing} />

          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{formatPrice(listing.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Publicado {formatTimeAgo(listing.createdAt)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                Se entrega en {formatLocation(listing.location)}
              </p>
            </div>

            <dl className="grid grid-cols-3 gap-3 rounded-2xl border bg-card p-4 text-sm">
              <Detail label="Talla" value={listing.size} />
              <Detail label="Estado" value={getConditionLabel(listing.condition)} />
              <Detail label="Tipo" value={getTypeInfo(listing.type).label} />
            </dl>

            {listing.description && (
              <p className="text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            )}

            {listing.team && (
              <DetailSection title="Equipo">
                <p className="text-sm">{getTeamLabel(listing.team)}</p>
              </DetailSection>
            )}

            {listing.seasons.length > 0 && (
              <DetailSection title="Temporada">
                <div className="flex flex-wrap gap-2">
                  {listing.seasons.map((season) => (
                    <span key={season} className="rounded-full bg-muted px-3 py-1 text-sm">
                      {getSeasonLabel(season)}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}

            {listing.colors.length > 0 && (
              <DetailSection title="Colores">
                <div className="flex flex-wrap gap-3">
                  {listing.colors.map((color) => {
                    const { label, hex } = getColorInfo(color)
                    return (
                      <span key={color} className="flex items-center gap-2 text-sm">
                        <span className="size-5 rounded-full border" style={{ backgroundColor: hex }} />
                        {label}
                      </span>
                    )
                  })}
                </div>
              </DetailSection>
            )}

            <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
              <UserAvatar user={listing.seller} />
              <div className="min-w-0 text-sm">
                <p className="font-medium">{listing.seller.username}</p>
                <p className="text-muted-foreground">Vendedor</p>
              </div>
            </div>

            {/* El chat llega en la etapa 7; por ahora el boton solo se muestra */}
            <div className="flex flex-col gap-1.5">
              <Button size="lg" disabled>
                <MessageCircle />
                Enviar mensaje al vendedor
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                El trato se cierra en persona. Los mensajes llegan pronto.
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  )
}
