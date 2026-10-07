import { useSyncExternalStore } from 'react'
import type { UserLocation } from '@/lib/locations'

// TEMPORAL: la ubicacion se guarda en este navegador (localStorage) para que no se pierda al recargar.
// Cuando haya login, pasa a ser un dato del perfil en Supabase y este hook la leera de ahi.

const STORAGE_KEY = 'niche:location'
const listeners = new Set<() => void>()

function readStored(): UserLocation | null {
  // El navegador puede bloquear el almacenamiento (modo privado); en ese caso se empieza sin ubicacion
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserLocation) : null
  } catch {
    return null
  }
}

let location: UserLocation | null = readStored()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useUserLocation() {
  return useSyncExternalStore(subscribe, () => location)
}

// null borra la ubicacion
export function useSetUserLocation() {
  return (next: UserLocation | null) => {
    location = next
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Si no se puede guardar, igual se usa mientras la pagina siga abierta
    }
    listeners.forEach((listener) => listener())
  }
}
