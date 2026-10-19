import { useSyncExternalStore } from 'react'
import { currentUser } from '@/lib/feed'
import type { Profile } from '@/lib/profile'

// TEMPORAL: el perfil vive en la memoria del navegador hasta que conectemos Supabase.
// Se conserva al cambiar de seccion, pero se borra al recargar la pagina.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

let profile: Profile = { ...currentUser, bio: '', socials: [], closetPublic: false }
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => profile)
}

export function useUpdateProfile() {
  return (changes: Partial<Profile>) => {
    profile = { ...profile, ...changes }
    listeners.forEach((listener) => listener())
  }
}
