import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { feedUserFromRow } from '@/hooks/usePosts'
import type { Tables } from '@/lib/database.types'
import { photoUrl } from '@/lib/photos'
import type { ReportGroup, ReportReason, ReportTarget, ReportTargetType } from '@/lib/reports'
import { supabase } from '@/lib/supabase'

// Si la sesion es de un admin (para mostrar el panel de reportes)
export function useIsAdmin() {
  const userId = useSession()?.user.id
  return (
    useQuery({
      queryKey: ['admin', userId],
      enabled: !!userId,
      queryFn: async () => {
        const { count, error } = await supabase.from('admins').select('*', { count: 'exact', head: true })
        if (error) throw error
        return (count ?? 0) > 0
      },
    }).data ?? false
  )
}

export class AlreadyReportedError extends Error {}

type NewReport = { type: ReportTargetType; id: string; reason: ReportReason; details: string }

export function useReport() {
  return useMutation({
    mutationFn: async ({ type, id, reason, details }: NewReport) => {
      const { error } = await supabase
        .from('reports')
        .insert({ target_type: type, target_id: id, reason, details: details.trim() })
      // 23505: ya habias reportado esto (cada quien reporta algo una sola vez)
      if (error?.code === '23505') throw new AlreadyReportedError('Ya lo habias reportado. Lo vamos a revisar.')
      if (error) throw error
    },
  })
}

type ReportRow = Tables<'reports'> & { reporter: Pick<Tables<'profiles'>, 'username' | 'name' | 'avatar_path'> }
type Author = Pick<Tables<'profiles'>, 'username' | 'name' | 'avatar_path'>

// Reportes sin resolver agrupados por lo reportado, con una vista previa de cada cosa (solo admin)
// ponytail: se traen los ultimos 200 reportes abiertos; paginar si llegan a ser mas
export function useOpenReports(enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'open'],
    enabled,
    queryFn: async (): Promise<ReportGroup[]> => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, reporter:profiles!reports_reporter_id_fkey(username, name, avatar_path)')
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error

      const groups = new Map<string, ReportGroup>()
      for (const row of data as ReportRow[]) {
        const key = `${row.target_type}:${row.target_id}`
        const group = groups.get(key) ?? {
          type: row.target_type as ReportTargetType,
          id: row.target_id,
          reports: [],
          target: null,
        }
        group.reports.push({
          reason: row.reason as ReportReason,
          details: row.details,
          reporter: feedUserFromRow(row.reporter),
          createdAt: new Date(row.created_at),
        })
        groups.set(key, group)
      }

      const list = [...groups.values()]
      const targets = await loadTargets(list)
      return list.map((group) => ({ ...group, target: targets.get(`${group.type}:${group.id}`) ?? null }))
    },
  })
}

// Lo reportado, por tipo, en una consulta por cada tipo
async function loadTargets(groups: ReportGroup[]) {
  const ids = (type: ReportTargetType) => groups.filter((group) => group.type === type).map((group) => group.id)
  const targets = new Map<string, ReportTarget>()
  const author = (row: Author) => feedUserFromRow(row)

  const [posts, comments, listings, profiles, messages] = await Promise.all([
    supabase.from('posts').select('id, caption, photos, author:profiles!posts_author_id_fkey(username, name, avatar_path)').in('id', ids('post')),
    supabase.from('comments').select('id, text, post_id, author:profiles!comments_author_id_fkey(username, name, avatar_path)').in('id', ids('comment')),
    supabase.from('listings').select('id, title, photos, seller:profiles!listings_seller_id_fkey(username, name, avatar_path)').in('id', ids('listing')),
    supabase.from('profiles').select('id, username, name, avatar_path, bio').in('id', ids('profile')),
    supabase.from('messages').select('id, body, sender:profiles!messages_sender_id_fkey(username, name, avatar_path)').in('id', ids('message')),
  ])
  for (const result of [posts, comments, listings, profiles, messages]) if (result.error) throw result.error

  for (const post of posts.data ?? [])
    targets.set(`post:${post.id}`, {
      owner: author(post.author), text: post.caption, thumbUrl: post.photos[0] && photoUrl(post.photos[0], true), link: `/p/${post.id}`,
    })
  for (const comment of comments.data ?? [])
    targets.set(`comment:${comment.id}`, { owner: author(comment.author), text: comment.text, link: `/p/${comment.post_id}` })
  for (const listing of listings.data ?? [])
    targets.set(`listing:${listing.id}`, {
      owner: author(listing.seller), text: listing.title, thumbUrl: listing.photos[0] && photoUrl(listing.photos[0], true), link: `/marketplace/${listing.id}`,
    })
  for (const profile of profiles.data ?? [])
    targets.set(`profile:${profile.id}`, { owner: author(profile), text: profile.bio, link: `/u/${profile.username}` })
  for (const message of messages.data ?? [])
    targets.set(`message:${message.id}`, { owner: author(message.sender), text: message.body })
  return targets
}

// Descartar: los reportes se marcan resueltos y lo reportado vuelve a verse si estaba oculto
export function useResolveReports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ type, id }: Pick<ReportGroup, 'type' | 'id'>) => {
      const { data, error } = await supabase
        .from('reports')
        .update({ resolved_at: new Date().toISOString() })
        .eq('target_type', type)
        .eq('target_id', id)
        .is('resolved_at', null)
        .select('id')
      if (error) throw error
      // Sin permiso la base de datos no da error, solo no cambia nada
      if (data.length === 0) throw new Error('No se pudo resolver el reporte')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  })
}

const tableOf = { post: 'posts', comment: 'comments', listing: 'listings' } as const

// Borrar lo reportado (publicacion, comentario o venta) y cerrar sus reportes
export function useDeleteReported() {
  const queryClient = useQueryClient()
  const resolve = useResolveReports()
  return useMutation({
    mutationFn: async ({ type, id }: { type: keyof typeof tableOf; id: string }) => {
      // ponytail: las fotos de lo borrado se quedan en Storage; limpiarlas si el espacio importa
      const { data, error } = await supabase.from(tableOf[type]).delete().eq('id', id).select('id')
      if (error) throw error
      if (data.length === 0) throw new Error('No se pudo borrar')
      await resolve.mutateAsync({ type, id })
    },
    onSuccess: () => {
      for (const list of ['posts', 'comments', 'listings']) queryClient.invalidateQueries({ queryKey: [list] })
    },
  })
}
