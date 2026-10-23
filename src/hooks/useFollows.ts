import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { feedUserFromRow } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'

// ponytail: la lista de seguidores muestra los primeros 100; paginar cuando alguien tenga mas
const LIST_LIMIT = 100

export type FollowKind = 'followers' | 'following'

// Cuantos siguen a la persona y a cuantos sigue ella
export function useFollowCounts(userId: string) {
  return useQuery({
    queryKey: ['follows', 'counts', userId],
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      ])
      if (followers.error) throw followers.error
      if (following.error) throw following.error
      return { followers: followers.count ?? 0, following: following.count ?? 0 }
    },
  }).data ?? { followers: 0, following: 0 }
}

// Si tu sigues a esa persona
export function useIsFollowing(userId: string) {
  const myId = useSession()?.user.id
  return (
    useQuery({
      queryKey: ['follows', 'is', myId, userId],
      enabled: !!myId,
      queryFn: async () => {
        const { count, error } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', myId!)
          .eq('following_id', userId)
        if (error) throw error
        return (count ?? 0) > 0
      },
    }).data ?? false
  )
}

// Seguir o dejar de seguir: el boton y el contador cambian al instante y regresan si falla
export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient()
  const myId = useSession()?.user.id
  const isKey = ['follows', 'is', myId, userId]
  const countsKey = ['follows', 'counts', userId]
  type Counts = { followers: number; following: number }

  return useMutation({
    mutationFn: async (follow: boolean) => {
      const { error } = follow
        ? await supabase.from('follows').insert({ following_id: userId })
        : await supabase.from('follows').delete().eq('follower_id', myId!).eq('following_id', userId)
      if (error) throw error
    },
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey: ['follows'] })
      queryClient.setQueryData(isKey, follow)
      queryClient.setQueryData<Counts>(countsKey, (counts) =>
        counts && { ...counts, followers: counts.followers + (follow ? 1 : -1) },
      )
    },
    onError: (_error, follow) => {
      queryClient.setQueryData(isKey, !follow)
      queryClient.setQueryData<Counts>(countsKey, (counts) =>
        counts && { ...counts, followers: counts.followers + (follow ? -1 : 1) },
      )
    },
    // Tu contador de seguidos y el feed "Siguiendo" tambien cambian
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] })
    },
  }).mutate
}

// Personas que siguen a alguien (followers) o a quienes sigue (following)
export function useFollowList(userId: string, kind: FollowKind, enabled: boolean) {
  return useQuery({
    queryKey: ['follows', 'list', userId, kind],
    enabled,
    queryFn: async () => {
      const { data, error } =
        kind === 'followers'
          ? await supabase
              .from('follows')
              .select('person:profiles!follows_follower_id_fkey(username, name, avatar_path)')
              .eq('following_id', userId)
              .order('created_at', { ascending: false })
              .limit(LIST_LIMIT)
          : await supabase
              .from('follows')
              .select('person:profiles!follows_following_id_fkey(username, name, avatar_path)')
              .eq('follower_id', userId)
              .order('created_at', { ascending: false })
              .limit(LIST_LIMIT)
      if (error) throw error
      return data.map((row) => feedUserFromRow(row.person))
    },
  })
}
