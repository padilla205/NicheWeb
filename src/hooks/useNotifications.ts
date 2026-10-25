import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useSession } from '@/hooks/useAuth'
import { feedUserFromRow } from '@/hooks/usePosts'
import type { FeedUser } from '@/lib/feed'
import { photoUrl } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// ponytail: se ven las 30 mas recientes; paginar si alguien recibe muchas
const LIMIT = 30

export type NotificationType = 'like' | 'comment' | 'reply' | 'share' | 'follow' | 'comment_like'

export type AppNotification = {
  id: string
  type: NotificationType
  actor: FeedUser
  postId?: string
  // Portada de la publicacion (si tiene foto propia)
  thumbUrl?: string
  commentText?: string
  createdAt: Date
  read: boolean
}

type NotificationRow = {
  id: string
  type: string
  post_id: string | null
  created_at: string
  read_at: string | null
  actor: { username: string; name: string; avatar_path: string | null }
  post: { photos: string[] } | null
  comment: { text: string } | null
}

// Tus notificaciones, las mas nuevas primero
export function useNotifications() {
  const userId = useSession()?.user.id
  return useQuery({
    queryKey: ['notifications', userId],
    enabled: !!userId,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select(
          'id, type, post_id, created_at, read_at, actor:profiles!notifications_actor_id_fkey(username, name, avatar_path), post:posts(photos), comment:comments(text)',
        )
        .order('created_at', { ascending: false })
        .limit(LIMIT)
      if (error) throw error
      return (data as unknown as NotificationRow[]).map((row) => ({
        id: row.id,
        type: row.type as NotificationType,
        actor: feedUserFromRow(row.actor),
        postId: row.post_id ?? undefined,
        thumbUrl: row.post?.photos[0] ? photoUrl(row.post.photos[0], true) : undefined,
        commentText: row.comment?.text || undefined,
        createdAt: new Date(row.created_at),
        read: row.read_at !== null,
      }))
    },
  })
}

// Marca todas como leidas; el numero rojo se quita al instante
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id
  const key = ['notifications', userId]

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null)
      if (error) throw error
    },
    onMutate: () =>
      queryClient.setQueryData<AppNotification[]>(key, (list) => list?.map((item) => ({ ...item, read: true }))),
    onError: () => queryClient.invalidateQueries({ queryKey: key }),
  }).mutate
}

// Escucha las notificaciones nuevas (Supabase solo manda las tuyas) y avisa con onNew
export function useNotificationsRealtime(onNew: () => void) {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id
  // La funcion mas reciente, sin volver a conectarse cada vez que cambia
  const onNewRef = useRef(onNew)
  useEffect(() => {
    onNewRef.current = onNew
  })

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (change) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        if (change.eventType === 'INSERT') onNewRef.current()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, userId])
}
