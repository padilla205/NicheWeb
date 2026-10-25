import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { listingFromRow, type ListingRow, WITH_SELLER } from '@/hooks/useListings'
import { supabase } from '@/lib/supabase'

// Ids de las ventas que guardaste, para pintar el corazon en cada tarjeta con una sola consulta
export function useFavoriteIds() {
  const userId = useSession()?.user.id
  return (
    useQuery({
      queryKey: ['favorites', 'ids', userId],
      enabled: !!userId,
      queryFn: async () => {
        const { data, error } = await supabase.from('favorites').select('listing_id')
        if (error) throw error
        return new Set(data.map((row) => row.listing_id))
      },
    }).data ?? new Set<string>()
  )
}

// Tus ventas guardadas, la mas reciente primero. Las que ya se vendieron (o se borraron) no salen
// ponytail: hasta 100 guardadas; paginar si alguien guarda mas
export function useSavedListings(enabled: boolean) {
  const userId = useSession()?.user.id
  return useQuery({
    queryKey: ['favorites', 'listings', userId],
    enabled: enabled && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`listing:listings(${WITH_SELLER})`)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data as unknown as { listing: ListingRow | null }[]).flatMap(({ listing }) =>
        listing ? [listingFromRow(listing)] : [],
      )
    },
  })
}

// Guardar o quitar: el corazon cambia al instante y regresa si falla
export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id
  const key = ['favorites', 'ids', userId]

  return useMutation({
    mutationFn: async ({ listingId, saved }: { listingId: string; saved: boolean }) => {
      const { error } = saved
        ? await supabase.from('favorites').insert({ listing_id: listingId })
        : await supabase.from('favorites').delete().eq('user_id', userId!).eq('listing_id', listingId)
      if (error) throw error
    },
    onMutate: async ({ listingId, saved }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Set<string>>(key)
      const next = new Set(previous)
      if (saved) next.add(listingId)
      else next.delete(listingId)
      queryClient.setQueryData(key, next)
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  }).mutate
}
