import { type InfiniteData, type QueryClient, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import type { ChatMessage, Conversation } from '@/lib/chat'
import type { Tables } from '@/lib/database.types'
import type { Listing, ListingStatus } from '@/lib/marketplace'
import { photoUrl } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// Mensajes por bloque; al subir en el chat se piden los anteriores
const PAGE_SIZE = 30
// ponytail: la lista de chats no se pagina; con mas de 50 chats activos agregar "Ver mas"
const CHATS_LIMIT = 50

// Cada persona se nombra por su llave porque los chats se conectan dos veces con perfiles
const CHAT_COLUMNS = `id, buyer_id, last_message, last_message_at,
  listing:listings(id, title, price, status, photos),
  buyer:profiles!conversations_buyer_id_fkey(username, name),
  seller:profiles!conversations_seller_id_fkey(username, name)`

type MessagePages = InfiniteData<ChatMessage[], string | null>

function fromMessageRow(row: Tables<'messages'>): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  }
}

// Agrega un mensaje al chat que ya esta en pantalla, o actualiza el que ya estaba (mismo id).
// Los mensajes van del mas nuevo al mas viejo
function putMessage(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<MessagePages>(['messages', message.conversationId], (data) => {
    if (!data) return data
    const exists = data.pages.some((page) => page.some((m) => m.id === message.id))
    const pages = exists
      ? data.pages.map((page) => page.map((m) => (m.id === message.id ? { ...m, ...message } : m)))
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
        return {
          id: row.id,
          listing: row.listing && {
            id: row.listing.id,
            title: row.listing.title,
            price: row.listing.price,
            status: row.listing.status as ListingStatus,
            thumbUrl: row.listing.photos[0] ? photoUrl(row.listing.photos[0], true) : '',
          },
          other: isBuyer ? row.seller : row.buyer,
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
        .select('*')
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

type SendMessage = { conversationId: string; body: string; id?: string }

// Optimista: el mensaje se ve al instante con un reloj; si falla queda marcado para reintentar.
// El id se crea aqui para reconocer el mismo mensaje cuando regresa por Realtime
export function useSendMessage() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  const mutation = useMutation({
    mutationFn: async (message: ChatMessage) => {
      const { error } = await supabase
        .from('messages')
        .insert({ id: message.id, conversation_id: message.conversationId, body: message.body })
      // 23505: ese id ya existe, o sea que el intento anterior si llego
      if (error && error.code !== '23505') throw error
    },
    onMutate: (message) => putMessage(queryClient, message),
    onSuccess: (_data, message) => {
      putMessage(queryClient, { ...message, status: undefined })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (_error, message) => putMessage(queryClient, { ...message, status: 'failed' }),
  })

  return ({ conversationId, body, id = crypto.randomUUID() }: SendMessage) =>
    mutation.mutate({
      id,
      conversationId,
      body,
      senderId: userId!,
      createdAt: new Date().toISOString(),
      status: 'sending',
      isNew: true,
    })
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
