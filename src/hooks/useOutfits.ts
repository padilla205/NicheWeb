import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { itemFromRow } from '@/hooks/useItems'
import { feedUserFromRow } from '@/hooks/usePosts'
import type { Tables } from '@/lib/database.types'
import type { Outfit } from '@/lib/outfits'
import { supabase } from '@/lib/supabase'

// ponytail: se traen hasta 60 outfits por persona; paginar si alguien guarda mas
const LIST_LIMIT = 60

export type OutfitRow = Tables<'outfits'> & {
  owner: Pick<Tables<'profiles'>, 'username' | 'name' | 'avatar_path' | 'closet_public'>
  outfit_items: { item: Tables<'items'> | null }[]
}

// El outfit con su dueno y sus prendas. Se nombra la llave porque outfits y perfiles tambien
// se conectan por las publicaciones
export const OUTFIT_COLUMNS =
  '*, owner:profiles!outfits_owner_id_fkey(username, name, avatar_path, closet_public), outfit_items(item:items(*))'

export function outfitFromRow(row: OutfitRow): Outfit {
  return {
    id: row.id,
    ownerId: row.owner_id,
    owner: feedUserFromRow(row.owner),
    ownerClosetPublic: row.owner.closet_public,
    name: row.name,
    isPublic: row.is_public,
    inCloset: row.in_closet,
    // Una prenda que ya no se puede ver (o se borro) simplemente no aparece
    items: row.outfit_items.flatMap(({ item }) => (item ? [itemFromRow(item)] : [])),
    createdAt: new Date(row.created_at),
  }
}

// Tus outfits guardados, o los que otra persona muestra en su closet
export function useOutfits(ownerId: string | undefined, onlyCloset = false) {
  return useQuery({
    queryKey: ['outfits', ownerId, onlyCloset],
    enabled: !!ownerId,
    queryFn: async () => {
      let request = supabase
        .from('outfits')
        .select(OUTFIT_COLUMNS)
        .eq('owner_id', ownerId!)
        .order('created_at', { ascending: false })
        .limit(LIST_LIMIT)
      if (onlyCloset) request = request.eq('in_closet', true)
      const { data, error } = await request
      if (error) throw error
      return (data as unknown as OutfitRow[]).map(outfitFromRow)
    },
  })
}

// Un outfit por su id; funciona sin sesion si es publico (link compartido). null si no se puede ver
export function useOutfit(id: string | undefined) {
  return useQuery({
    queryKey: ['outfits', 'one', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('outfits').select(OUTFIT_COLUMNS).eq('id', id!).maybeSingle()
      if (error) throw error
      return data ? outfitFromRow(data as unknown as OutfitRow) : null
    },
  })
}

type NewOutfit = { name: string; itemIds: string[]; inCloset: boolean }

export function useSaveOutfit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, itemIds, inCloset }: NewOutfit) => {
      const { data, error } = await supabase
        .from('outfits')
        .insert({ name: name.trim(), in_closet: inCloset, is_public: inCloset })
        .select('id')
        .single()
      if (error) throw error
      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(itemIds.map((item_id) => ({ outfit_id: data.id, item_id })))
      if (itemsError) {
        // Sin sus prendas el outfit no sirve: se quita para no dejarlo a medias
        await supabase.from('outfits').delete().eq('id', data.id)
        throw itemsError
      }
      return data.id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outfits'] }),
  })
}

// Mostrar u ocultar en el closet del perfil. Mostrarlo lo hace publico; ocultarlo no le quita
// el link a quien ya lo tenga (el outfit puede estar publicado en el feed)
export function useSetOutfitInCloset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ outfit, inCloset }: { outfit: Outfit; inCloset: boolean }) => {
      const { error } = await supabase
        .from('outfits')
        .update(inCloset ? { in_closet: true, is_public: true } : { in_closet: false })
        .eq('id', outfit.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outfits'] }),
  })
}

// Hace publico el outfit para que su link se pueda abrir sin cuenta
export function useMakeOutfitPublic() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (outfit: Outfit) => {
      if (outfit.isPublic) return
      const { error } = await supabase.from('outfits').update({ is_public: true }).eq('id', outfit.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outfits'] }),
  })
}

// Borra el outfit; sus publicaciones sin foto propia se borran con el (lo hace la base de datos)
export function useDeleteOutfit() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async (outfit: Outfit) => {
      const { error } = await supabase.from('outfits').delete().eq('id', outfit.id).eq('owner_id', userId!)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
