import { ArrowLeft, ExternalLink, LogIn, MapPin, MessageCircle } from 'lucide-react'
import { lazy, type ReactNode, Suspense } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ReportButton } from '@/components/ReportDialog'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useAuth'
import { useOpenConversation } from '@/hooks/useChat'
import { useListing } from '@/hooks/useListings'
import { getColorInfo, getSeasonLabel } from '@/lib/clothing'
import { formatTimeAgo } from '@/lib/feed'
import { formatPrice, getConditionLabel } from '@/lib/marketplace'
import { formatLocation } from '@/lib/locations'
import { getTeamLabel } from '@/lib/teams'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { ListingGallery } from './ListingGallery'
import { ListingOwnerActions } from './ListingOwnerActions'
import { ShareButton } from './ShareButton'
import { SizeGuide } from './SizeGuide'
import { StatusBadge } from './StatusBadge'

// El mapa solo se descarga en las ventas que tienen lugar de entrega
const DeliveryMap = lazy(() => import('@/components/DeliveryMap'))

export function ListingDetailPage() {
  const { id } = useParams()
  const { data: listing, isPending } = useListing(id)
  // Esta pagina se puede abrir sin cuenta (por ejemplo, desde un link compartido)
  const session = useSession()
  const isMine = !!session && listing?.sellerId === session.user.id
  const navigate = useNavigate()
  const openChat = useOpenConversation()

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to="/marketplace">
            <ArrowLeft />
            Volver al marketplace
          </Link>
        </Button>
        {listing && <ShareButton title={listing.title} />}
      </div>

      {isPending ? (
        <DetailSkeleton />
      ) : !listing ? (
        <p className="py-20 text-center text-sm text-muted-foreground">Esta venta ya no existe.</p>
      ) : (
        // En escritorio la foto va a la izquierda y la informacion a la derecha; en celular una abajo de otra
        <article className="grid gap-6 md:grid-cols-2">
          <ListingGallery key={listing.id} listing={listing} />

          <div className="flex flex-col gap-5">
            <div>
              {listing.status !== 'disponible' && <StatusBadge listing={listing} className="mb-2 inline-block" />}
              <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{formatPrice(listing.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Publicado {formatTimeAgo(listing.createdAt)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                Se entrega en {formatLocation(listing.location)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <dl className="grid grid-cols-3 gap-3 rounded-2xl border bg-card p-4 text-sm">
                <Detail label="Talla" value={listing.size} />
                <Detail label="Estado" value={getConditionLabel(listing.condition)} />
                <Detail label="Tipo" value={listing.type} />
              </dl>
              <SizeGuide size={listing.size} />
            </div>

            {listing.delivery && (
              <DetailSection title="Lugar de entrega">
                <p className="text-sm">
                  {listing.delivery.radiusKm
                    ? `Entrega a ${listing.delivery.radiusKm} km a la redonda de este punto`
                    : 'Punto de encuentro'}
                </p>
                <Suspense fallback={<div className="h-56 animate-pulse rounded-lg bg-muted" />}>
                  <DeliveryMap center={listing.delivery} value={listing.delivery} className="h-56" />
                </Suspense>
                {/* Abre la app de mapas del celular (o Google Maps en la computadora) para llegar */}
                <Button variant="outline" size="sm" className="self-start" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${listing.delivery.lat},${listing.delivery.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                    Abrir en mapas
                  </a>
                </Button>
              </DetailSection>
            )}

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

            {isMine ? (
              <ListingOwnerActions listing={listing} />
            ) : !session ? (
              // Sin cuenta se ve todo, pero para escribirle al vendedor hay que entrar
              <Button size="lg" asChild>
                <Link to="/login" state={{ from: `/marketplace/${listing.id}` }}>
                  <LogIn />
                  Inicia sesion para escribirle al vendedor
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Button
                  size="lg"
                  disabled={listing.status === 'vendida' || openChat.isPending}
                  onClick={() => openChat.mutate(listing, { onSuccess: (chatId) => navigate(`/chat/${chatId}`) })}
                >
                  <MessageCircle />
                  {openChat.isPending ? 'Abriendo chat' : 'Enviar mensaje al vendedor'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {openChat.isError
                    ? 'No se pudo abrir el chat, intenta de nuevo.'
                    : listing.status === 'vendida'
                      ? 'Esta prenda ya se vendio.'
                      : 'El trato se cierra en persona.'}
                </p>
                <ReportButton type="listing" id={listing.id} label="Reportar venta" />
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  )
}

// Forma de la pagina mientras llega la venta
function DetailSkeleton() {
  return (
    <div aria-hidden className="grid gap-6 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
      <div className="flex flex-col gap-3">
        <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-9 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-20 animate-pulse rounded-2xl bg-muted" />
      </div>
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
