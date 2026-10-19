import { Pencil, Trash2 } from 'lucide-react'
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
import { useDeleteListing, useSetListingStatus } from '@/hooks/useListings'
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
    deleteListing(listing.id)
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
      <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Tu venta</h2>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Estado de la venta">
        {listingStatuses.map((status) => (
          <ChoicePill
            key={status.value}
            active={listing.status === status.value}
            onClick={() => setStatus(listing.id, status.value)}
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
