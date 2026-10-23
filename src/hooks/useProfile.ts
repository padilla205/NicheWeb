import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import type { Tables, TablesUpdate } from '@/lib/database.types'
import { deletePhotos, photoUrl, uploadPhoto } from '@/lib/photos'
import type { Profile, SocialLink } from '@/lib/profile'
import { supabase } from '@/lib/supabase'

type ProfileData = Profile & { id: string; avatarPath: string | null; coverPath: string | null }

// Fila de la base de datos -> lo que usan las pantallas
export function profileFromRow(row: Tables<'profiles'>): ProfileData {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio,
    // La foto de perfil se ve chica, asi que basta la miniatura
    avatarUrl: row.avatar_path ? photoUrl(row.avatar_path, true) : undefined,
    coverUrl: row.cover_path ? photoUrl(row.cover_path) : undefined,
    avatarPath: row.avatar_path,
    coverPath: row.cover_path,
    socials: row.socials as SocialLink[],
    closetPublic: row.closet_public,
  }
}

// Perfil de quien tiene la sesion iniciada
export function useProfileQuery() {
  const userId = useSession()?.user.id
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId!).single()
      if (error) throw error
      return profileFromRow(data)
    },
  })
}

// RequireAuth espera a que cargue el perfil antes de mostrar la app, asi que aqui siempre existe
export function useProfile() {
  const { data } = useProfileQuery()
  if (!data) throw new Error('useProfile solo se usa dentro de RequireAuth')
  return data
}

export type ProfileChanges = Partial<Pick<Profile, 'name' | 'bio' | 'socials' | 'closetPublic'>> & {
  avatar?: File
  cover?: File
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const profile = useProfile()
  const key = ['profile', profile.id]

  return useMutation({
    mutationFn: async ({ avatar, cover, name, bio, socials, closetPublic }: ProfileChanges) => {
      // Las fotos nuevas se comprimen y suben primero; si algo falla, el perfil no cambia
      const [avatarPath, coverPath] = await Promise.all([
        avatar && uploadPhoto(avatar, profile.id),
        cover && uploadPhoto(cover, profile.id),
      ])
      const row: TablesUpdate<'profiles'> = {
        name,
        bio,
        socials,
        closet_public: closetPublic,
        avatar_path: avatarPath,
        cover_path: coverPath,
      }
      const { data, error } = await supabase.from('profiles').update(row).eq('id', profile.id).select().single()
      if (error) throw error
      // Las fotos anteriores ya no se usan; si no se pueden borrar no pasa nada grave
      const replaced = [avatarPath && profile.avatarPath, coverPath && profile.coverPath].filter(
        (path): path is string => !!path,
      )
      deletePhotos(replaced).catch(() => {})
      return profileFromRow(data)
    },
    // Optimista: el cambio se ve al instante y se deshace si Supabase lo rechaza
    onMutate: async ({ avatar, cover, ...changes }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ProfileData>(key)
      queryClient.setQueryData<ProfileData>(key, (current) =>
        current && {
          ...current,
          ...changes,
          avatarUrl: avatar ? URL.createObjectURL(avatar) : current.avatarUrl,
          coverUrl: cover ? URL.createObjectURL(cover) : current.coverUrl,
        },
      )
      return { previous }
    },
    onError: (_error, _changes, context) => queryClient.setQueryData(key, context?.previous),
    onSuccess: (saved) => queryClient.setQueryData(key, saved),
  })
}

// Perfil de otra persona por su usuario; null si no existe
export function useUserProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', 'user', username],
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username!).maybeSingle()
      if (error) throw error
      return data ? profileFromRow(data) : null
    },
  })
}
