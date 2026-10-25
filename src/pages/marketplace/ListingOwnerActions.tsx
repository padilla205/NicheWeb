import { Eye, Heart, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { ChoicePill } from '@/components/ChoicePill'
import { MorphButton } from '@/components/MorphButton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDeleteListing, useListingStats, useSetListingStatus } from '@/hooks/useListings'
import { type Listing, listingStatuses } from '@/lib/marketplace'
import { CreateListingDialog } from './CreateListingDialog'

// Lo que el vendedor puede hacer con su propia venta: cambiar su estado, editarla o borrarla
export function ListingOwnerActions({ listing }: { listing: Listing }) {
  const setStatus = useSetListingStatus()
  const deleteListing = useDeleteListing()
  const navigate = useNavigate()
  // Boton que abrio "Editar"; null si la ventana esta cerrada
  const [editOrigin, setEditOrigin] = useState<HTMLElement | null>(null)
  const closeEdit = useCallback(() => setEditOrigin(null), [])

  function remove() {
    // Primero sale de la pagina, para no mostrar "Esta venta ya no existe" ni un instante
    navigate('/marketplace')
    deleteListing.mutate(listing)
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tu venta</h2>
      <ListingStats listingId={listing.id} />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Estado de la venta">
        {listingStatuses.map((status) => (
          <ChoicePill
            key={status.value}
            slideId="listing-status"
            active={listing.status === status.value}
            onClick={() => setStatus.mutate({ id: listing.id, status: status.value })}
          >
            {status.label}
          </ChoicePill>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Apartada: se sigue viendo con su etiqueta. Vendida: ya no aparece en el marketplace.
      </p>

      <div className="flex flex-wrap gap-2">
        <MorphButton variant="outline" hidden={editOrigin !== null} onOpen={setEditOrigin}>
          <Pencil />
          Editar
        </MorphButton>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 />
              Borrar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Borrar esta venta?</DialogTitle>
              <DialogDescription>
                "{listing.title}" se quitara del marketplace. Esto no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button variant="destructive" onClick={remove}>
                Borrar venta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <CreateListingDialog origin={editOrigin} onClose={closeEdit} listing={listing} />
    </section>
  )
}

// Como le va a tu venta: personas que la vieron, la guardaron y te escribieron
function ListingStats({ listingId }: { listingId: string }) {
  const { data: stats } = useListingStats(listingId)
  const items = [
    { icon: Eye, value: stats?.views, label: (n: number) => (n === 1 ? 'vista' : 'vistas') },
    { icon: Heart, value: stats?.saves, label: (n: number) => (n === 1 ? 'guardada' : 'guardadas') },
    { icon: MessageCircle, value: stats?.chats, label: (n: number) => (n === 1 ? 'chat' : 'chats') },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label(2)} className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
          <Icon className="size-4 text-muted-foreground" />
          {value === undefined ? (
            <div aria-hidden className="h-6 w-8 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-semibold tabular-nums">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label(value ?? 2)}</p>
        </div>
      ))}
    </div>
  )
}
