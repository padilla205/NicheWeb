import { useSyncExternalStore } from 'react'
import type { ClosetItem, ClothingType, Season } from '@/lib/clothing'

// TEMPORAL: las prendas viven en la memoria del navegador hasta que conectemos Supabase.
// Se conservan al cambiar de seccion, pero se borran al recargar la pagina.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

export type NewItem = {
  photos: File[]
  name: string
  type: ClothingType
  seasons: Season[]
  colors: string[]
  team?: string
}

let items: ClosetItem[] = []
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useItems() {
  return useSyncExternalStore(subscribe, () => items)
}

export function useAddItem() {
  return (item: NewItem) => {
    const newItem: ClosetItem = {
      id: crypto.randomUUID(),
      photoUrls: item.photos.map((photo) => URL.createObjectURL(photo)),
      name: item.name.trim(),
      type: item.type,
      seasons: item.seasons,
      colors: item.colors,
      team: item.team,
      createdAt: new Date(),
    }
    // Las mas nuevas van primero
    items = [newItem, ...items]
    listeners.forEach((listener) => listener())
  }
}
