import { useSyncExternalStore } from 'react'
import type { Season } from '@/lib/clothing'
import { currentUser } from '@/lib/feed'
import type { UserLocation } from '@/lib/locations'
import { type Delivery, type Listing, type ListingCondition, type ListingStatus, sampleListings } from '@/lib/marketplace'

// TEMPORAL: las ventas viven en la memoria del navegador hasta que conectemos Supabase.
// Se conservan al cambiar de seccion, pero se borran al recargar la pagina.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

export type NewListing = {
  photos: File[]
  title: string
  price: number
  size: string
  location: UserLocation
  delivery?: Delivery
  condition: ListingCondition
  type: string
  seasons: Season[]
  colors: string[]
  team?: string
  description: string
}

let listings: Listing[] = sampleListings
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useListings() {
  return useSyncExternalStore(subscribe, () => listings)
}

// Una sola venta por su id; undefined si no existe
export function useListing(id: string | undefined) {
  const all = useListings()
  return all.find((listing) => listing.id === id)
}

// Datos del formulario ya limpios, listos para guardar en una venta
function fromForm({ photos, title, description, size, type, ...rest }: NewListing) {
  return {
    ...rest,
    title: title.trim(),
    description: description.trim(),
    size: size.trim(),
    type: type.trim(),
    photoUrls: photos.map((photo) => URL.createObjectURL(photo)),
  }
}

function save(next: Listing[]) {
  listings = next
  listeners.forEach((listener) => listener())
}

export function useCreateListing() {
  return (data: NewListing) => {
    const listing: Listing = {
      ...fromForm(data),
      id: crypto.randomUUID(),
      seller: currentUser,
      status: 'disponible',
      createdAt: new Date(),
    }
    // Las mas nuevas van primero
    save([listing, ...listings])
  }
}

export function useUpdateListing() {
  return (id: string, data: NewListing) =>
    save(
      listings.map((listing) => {
        if (listing.id !== id) return listing
        const changes = fromForm(data)
        // Las ventas de ejemplo no tienen fotos; si no se agregan, conservan su degradado
        return { ...listing, ...changes, photoUrls: changes.photoUrls.length > 0 ? changes.photoUrls : listing.photoUrls }
      }),
    )
}

export function useSetListingStatus() {
  return (id: string, status: ListingStatus) =>
    save(listings.map((listing) => (listing.id === id ? { ...listing, status } : listing)))
}

export function useDeleteListing() {
  return (id: string) => save(listings.filter((listing) => listing.id !== id))
}
