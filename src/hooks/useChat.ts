import { type InfiniteData, type QueryClient, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import type { ChatMessage, Conversation, ReactionEmoji } from '@/lib/chat'
import type { Tables } from '@/lib/database.types'
import type { Listing, ListingStatus } from '@/lib/marketplace'
import { deletePhotos, photoUrl, uploadPhoto } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// Mensajes por bloque; al subir en el chat se piden los anteriores
const PAGE_SIZE = 30
// ponytail: la lista de chats no se pagina; con mas de 50 chats activos agregar "Ver mas"
const CHATS_LIMIT = 50

// Cada persona se nombra por su llave porque los chats se conectan dos veces con perfiles
const CHAT_COLUMNS = `id, buyer_id, last_message, last_message_at,
  listing:listings(id, title, price, status, photos),
  buyer:profiles!conversations_buyer_id_fkey(id, username, name, avatar_path),
  seller:profiles!conversations_seller_id_fkey(id, username, name, avatar_path)`

type MessagePages = InfiniteData<ChatMessage[], string | null>

type MessageRow = Tables<'messages'> & { reactions?: { user_id: string; emoji: string }[] }

// Las reacciones solo vienen al pedir los mensajes; lo que llega por Realtime no las trae y no las borra
function fromMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    imagePath: row.image_path ?? undefined,
    imageUrl: row.image_path ? photoUrl(row.image_path) : undefined,
    thumbUrl: row.image_path ? photoUrl(row.image_path, true) : undefined,
    createdAt: row.created_at,
    editedAt: row.edited_at ?? undefined,
    deleted: !!row.deleted_at,
    ...(row.reactions && {
      reactions: row.reactions.map((r) => ({ userId: r.user_id, emoji: r.emoji as ReactionEmoji })),
    }),
  }
}

// Cambia un mensaje donde este (no se sabe de que chat es cuando llega una reaccion por Realtime)
function updateMessage(queryClient: QueryClient, id: string, change: (message: ChatMessage) => ChatMessage) {
  queryClient.setQueriesData<MessagePages>({ queryKey: ['messages'] }, (data) =>
    data && { ...data, pages: data.pages.map((page) => page.map((m) => (m.id === id ? change(m) : m))) },
  )
}

// Agrega un mensaje al chat que ya esta en pantalla, o actualiza el que ya estaba (mismo id).
// Los mensajes van del mas nuevo al mas viejo
function putMessage(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<MessagePages>(['messages', message.conversationId], (data) => {
    if (!data) return data
    const exists = data.pages.some((page) => page.some((m) => m.id === message.id))
    const pages = exists
      ? data.pages.map((page) =>
          page.map((m) => {
            if (m.id !== message.id) return m
            // La foto local ya se ve: se conserva para que no parpadee al cambiar a la de Supabase
            const local =
              m.thumbUrl?.startsWith('blob:') && !message.deleted ? { imageUrl: m.imageUrl, thumbUrl: m.thumbUrl } : {}
            return { ...m, ...message, ...local }
          }),
        )
      : [[message, ...(data.pages[0] ?? [])], ...data.pages.slice(1)]
    return { ...data, pages }
  })
}

// Tus chats, del que tiene el mensaje mas reciente al mas viejo
export function useConversations() {
  const userId = useSession()?.user.id

  return useQuery({
    queryKey: ['chats', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from('conversations')
        .select(CHAT_COLUMNS)
        // Un chat sin mensajes solo lo ve quien lo abrio (el comprador)
        .or(`last_message_at.not.is.null,buyer_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: true })
        .limit(CHATS_LIMIT)
      if (error) throw error
      return data.map((row) => {
        const isBuyer = row.buyer_id === userId
        const other = isBuyer ? row.seller : row.buyer
        return {
          id: row.id,
          listing: row.listing && {
            id: row.listing.id,
            title: row.listing.title,
            price: row.listing.price,
            status: row.listing.status as ListingStatus,
            thumbUrl: row.listing.photos[0] ? photoUrl(row.listing.photos[0], true) : '',
          },
          other: {
            username: other.username,
            name: other.name,
            avatarUrl: other.avatar_path ? photoUrl(other.avatar_path, true) : undefined,
          },
          otherId: other.id,
          isBuyer,
          lastMessage: row.last_message,
          lastMessageAt: row.last_message_at ? new Date(row.last_message_at) : null,
        }
      })
    },
  })
}

// Mensajes de un chat, de 30 en 30 empezando por los mas nuevos
export function useMessages(conversationId: string) {
  const query = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      let request = supabase
        .from('messages')
        .select('*, reactions:message_reactions(user_id, emoji)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (pageParam) request = request.lt('created_at', pageParam)
      const { data, error } = await request
      if (error) throw error
      return data.map(fromMessageRow)
    },
    // El siguiente bloque son los mensajes anteriores al mas viejo que ya se tiene
    getNextPageParam: (last) => (last.length < PAGE_SIZE ? undefined : last[last.length - 1].createdAt),
  })

  return {
    messages: query.data?.pages.flat() ?? [],
    isPending: query.isPending,
    hasOlder: query.hasNextPage,
    loadOlder: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage()
    },
  }
}

// Escucha los mensajes nuevos de todos tus chats (Supabase solo manda los que puedes ver).
// Se usa una vez, en la barra de arriba, para que el contador de no leidos cambie en cualquier seccion
export function useChatRealtime() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, ({ new: row }) => {
        putMessage(queryClient, { ...fromMessageRow(row as Tables<'messages'>), isNew: true })
        queryClient.invalidateQueries({ queryKey: ['chats'] })
        queryClient.invalidateQueries({ queryKey: ['unread'] })
      })
      // Mensajes editados o borrados
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, ({ new: row }) => {
        putMessage(queryClient, fromMessageRow(row as Tables<'messages'>))
        queryClient.invalidateQueries({ queryKey: ['chats'] })
      })
      // Reacciones puestas, cambiadas o quitadas
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, (change) => {
        const row = (change.eventType === 'DELETE' ? change.old : change.new) as Tables<'message_reactions'>
        updateMessage(queryClient, row.message_id, (m) => ({
          ...m,
          reactions: [
            ...(m.reactions ?? []).filter((r) => r.userId !== row.user_id),
            ...(change.eventType === 'DELETE' ? [] : [{ userId: row.user_id, emoji: row.emoji as ReactionEmoji }]),
          ],
        }))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, userId])
}

// Mensajes sin leer por chat: { idDelChat: cantidad }. Solo trae los chats que tienen alguno
export function useUnreadCounts() {
  const userId = useSession()?.user.id

  return (
    useQuery({
      queryKey: ['unread', userId],
      enabled: !!userId,
      queryFn: async () => {
        const { data, error } = await supabase.rpc('unread_counts')
        if (error) throw error
        return Object.fromEntries(data.map((row) => [row.conversation_id, row.unread])) as Record<string, number>
      },
    }).data ?? {}
  )
}

// Marca el chat como leido; el contador se borra al instante, sin esperar a Supabase
export function useMarkChatRead() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  const mutation = useMutation({
    mutationFn: async (chat: string) => {
      const { error } = await supabase.rpc('mark_chat_read', { chat })
      if (error) throw error
    },
    onMutate: async (chat) => {
      const key = ['unread', userId]
      await queryClient.cancelQueries({ queryKey: key })
      queryClient.setQueryData<Record<string, number>>(key, (counts) => counts && { ...counts, [chat]: 0 })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['unread'] }),
  })

  return mutation.mutate
}

type SendMessage = { conversationId: string; body: string; file?: File; id?: string }

// Optimista: el mensaje se ve al instante con un reloj; si falla queda marcado para reintentar.
// El id se crea aqui para reconocer el mismo mensaje cuando regresa por Realtime
export function useSendMessage() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  const mutation = useMutation({
    // En fila: una foto tarda en comprimirse y el mensaje que mandas despues no debe ganarle
    scope: { id: 'send-message' },
    mutationFn: async (message: ChatMessage) => {
      // Primero se comprime y sube la foto (los GIF van tal cual)
      const imagePath = message.file ? await uploadPhoto(message.file, userId!) : null
      const { error } = await supabase
        .from('messages')
        .insert({ id: message.id, conversation_id: message.conversationId, body: message.body, image_path: imagePath })
      // 23505: ese id ya existe, o sea que el intento anterior si llego
      if (error && error.code !== '23505') throw error
    },
    onMutate: (message) => putMessage(queryClient, message),
    onSuccess: (_data, message) => {
      putMessage(queryClient, { ...message, status: undefined, file: undefined })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (_error, message) => {
      putMessage(queryClient, { ...message, status: 'failed' })
      // Puede que te hayan bloqueado: se vuelve a revisar para mostrarlo en el chat
      queryClient.invalidateQueries({ queryKey: ['blocks'] })
    },
  })

  return ({ conversationId, body, file, id = crypto.randomUUID() }: SendMessage) => {
    const preview = file && URL.createObjectURL(file)
    mutation.mutate({
      id,
      conversationId,
      body,
      file,
      imageUrl: preview,
      thumbUrl: preview,
      senderId: userId!,
      createdAt: new Date().toISOString(),
      status: 'sending',
      isNew: true,
    })
  }
}

// Abre el chat con el vendedor de una venta; si ya existia, regresa ese mismo
export function useOpenConversation() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async (listing: Listing) => {
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', userId!)
        .maybeSingle()
      if (findError) throw findError
      if (existing) return existing.id

      const { data, error } = await supabase
        .from('conversations')
        .insert({ listing_id: listing.id, seller_id: listing.sellerId })
        .select('id')
        .single()
      if (error) throw error
      return data.id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })
}

// Chats que silenciaste: siguen llegando, pero no suman al numero rojo de arriba
export function useChatMutes() {
  const userId = useSession()?.user.id

  return (
    useQuery({
      queryKey: ['chat-mutes', userId],
      enabled: !!userId,
      queryFn: async () => {
        const { data, error } = await supabase.from('chat_mutes').select('conversation_id')
        if (error) throw error
        return new Set(data.map((row) => row.conversation_id))
      },
    }).data ?? new Set<string>()
  )
}

// Silencia o quita el silencio; el cambio se ve al instante y regresa si falla
export function useToggleMute() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id
  const key = ['chat-mutes', userId]

  return useMutation({
    mutationFn: async ({ chat, muted }: { chat: string; muted: boolean }) => {
      const { error } = muted
        ? await supabase.from('chat_mutes').insert({ conversation_id: chat })
        : await supabase.from('chat_mutes').delete().eq('conversation_id', chat)
      if (error) throw error
    },
    onMutate: async ({ chat, muted }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Set<string>>(key)
      const next = new Set(previous)
      if (muted) next.add(chat)
      else next.delete(chat)
      queryClient.setQueryData(key, next)
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  }).mutate
}

export type BlockState = 'none' | 'blocked-by-me' | 'blocked-me'

// Si tu bloqueaste a esa persona, si ella te bloqueo a ti, o ninguno
export function useBlockState(otherId: string | undefined): BlockState {
  const userId = useSession()?.user.id
  const { data } = useQuery({
    queryKey: ['blocks', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from('blocks').select('blocker_id, blocked_id')
      if (error) throw error
      return data
    },
  })
  if (data?.some((b) => b.blocker_id === userId && b.blocked_id === otherId)) return 'blocked-by-me'
  if (data?.some((b) => b.blocker_id === otherId && b.blocked_id === userId)) return 'blocked-me'
  return 'none'
}

// Bloquea o desbloquea a una persona; los dos dejan de poder escribirse
export function useToggleBlock() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id
  const key = ['blocks', userId]
  type Row = { blocker_id: string; blocked_id: string }

  return useMutation({
    mutationFn: async ({ otherId, blocked }: { otherId: string; blocked: boolean }) => {
      const { error } = blocked
        ? await supabase.from('blocks').insert({ blocked_id: otherId })
        : await supabase.from('blocks').delete().eq('blocker_id', userId!).eq('blocked_id', otherId)
      if (error) throw error
    },
    onMutate: async ({ otherId, blocked }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Row[]>(key)
      const others = (previous ?? []).filter((b) => !(b.blocker_id === userId && b.blocked_id === otherId))
      queryClient.setQueryData(key, blocked ? [...others, { blocker_id: userId!, blocked_id: otherId }] : others)
      return { previous }
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  }).mutate
}

// Pone, cambia o quita tu reaccion: tocar la misma la quita. Se ve al instante
export function useToggleReaction() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async ({ message, emoji }: { message: ChatMessage; emoji: ReactionEmoji }) => {
      const mine = message.reactions?.find((r) => r.userId === userId)
      const { error } =
        mine?.emoji === emoji
          ? await supabase.from('message_reactions').delete().eq('message_id', message.id).eq('user_id', userId!)
          : await supabase.from('message_reactions').upsert({ message_id: message.id, emoji })
      if (error) throw error
    },
    onMutate: ({ message, emoji }) => {
      const mine = message.reactions?.find((r) => r.userId === userId)
      const others = (message.reactions ?? []).filter((r) => r.userId !== userId)
      updateMessage(queryClient, message.id, (m) => ({
        ...m,
        reactions: mine?.emoji === emoji ? others : [...others, { userId: userId!, emoji }],
      }))
    },
    onError: (_error, { message }) => queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] }),
  }).mutate
}

// Cambia el texto de tu mensaje (solo en los primeros 10 minutos)
export function useEditMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ message, body }: { message: ChatMessage; body: string }) => {
      // Pasados los 10 minutos la base de datos no cambia nada (y no da error): se revisa que si cambio
      const { data, error } = await supabase.from('messages').update({ body }).eq('id', message.id).select('id')
      if (error) throw error
      if (data.length === 0) throw new Error('Ya no se puede editar')
    },
    onMutate: ({ message, body }) =>
      updateMessage(queryClient, message.id, (m) => ({ ...m, body, editedAt: new Date().toISOString() })),
    onError: (_error, { message }) => queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  }).mutate
}

// Borra tu mensaje para los dos (solo en los primeros 10 minutos); su foto tambien se borra
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (message: ChatMessage) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', message.id)
        .select('id')
      if (error) throw error
      if (data.length === 0) throw new Error('Ya no se puede borrar')
      if (message.imagePath) deletePhotos([message.imagePath]).catch(() => {})
    },
    onMutate: (message) =>
      updateMessage(queryClient, message.id, (m) => ({
        ...m,
        deleted: true,
        body: '',
        imageUrl: undefined,
        thumbUrl: undefined,
        reactions: [],
      })),
    onError: (_error, message) => queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  }).mutate
}
