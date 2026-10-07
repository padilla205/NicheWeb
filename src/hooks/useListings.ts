import { useSyncExternalStore } from 'react'
import type { ClothingType, Season } from '@/lib/clothing'
import { currentUser } from '@/lib/feed'
import type { UserLocation } from '@/lib/locations'
import { type Listing, type ListingCondition, sampleListings } from '@/lib/marketplace'

// TEMPORAL: las ventas viven en la memoria del navegador hasta que conectemos Supabase.
// Se conservan al cambiar de seccion, pero se borran al recargar la pagina.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

export type NewListing = {
  photos: File[]
  title: string
  price: number
  size: string
  location: UserLocation
  condition: ListingCondition
  type: ClothingType
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

export function useCreateListing() {
  return ({ photos, title, description, size, ...rest }: NewListing) => {
    const listing: Listing = {
      ...rest,
      id: crypto.randomUUID(),
      seller: currentUser,
      title: title.trim(),
      description: description.trim(),
      size: size.trim(),
      photoUrls: photos.map((photo) => URL.createObjectURL(photo)),
      createdAt: new Date(),
    }
    // Las mas nuevas van primero
    listings = [listing, ...listings]
    listeners.forEach((listener) => listener())
  }
}
