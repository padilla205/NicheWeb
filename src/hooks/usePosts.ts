import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSession } from '@/hooks/useAuth'
import { OUTFIT_COLUMNS, outfitFromRow, type OutfitRow } from '@/hooks/useOutfits'
import type { Season } from '@/lib/clothing'
import type { Tables } from '@/lib/database.types'
import type { FeedUser, Post, PostComment } from '@/lib/feed'
import { deletePhotos, photoUrl, savePhotos, uploadPhoto } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// Publicaciones por bloque antes de "Ver mas"
const PAGE_SIZE = 12
const HOUR_MS = 60 * 60 * 1000

type ProfileBits = Pick<Tables<'profiles'>, 'username' | 'name' | 'avatar_path'>
export type PostRow = Tables<'posts'> & {
  author: ProfileBits
  likes: { count: number }[]
  comments: { count: number }[]
  outfit: OutfitRow | null
}
type PostsPage = { items: Post[]; total: number }

// Columnas de la publicacion con su autor y sus contadores. Se nombra la llave del autor porque
// publicaciones y perfiles tambien se conectan por likes, comentarios y compartidos
export const POST_COLUMNS = `*, author:profiles!posts_author_id_fkey(username, name, avatar_path), likes(count), comments(count),
  outfit:outfits(${OUTFIT_COLUMNS})`

export function feedUserFromRow(row: ProfileBits): FeedUser {
  return {
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_path ? photoUrl(row.avatar_path, true) : undefined,
  }
}

// Filas de la base de datos -> lo que usan las pantallas, con tus likes y compartidos
export async function toPosts(rows: PostRow[], userId: string | undefined): Promise<Post[]> {
  const ids = rows.map((row) => row.id)
  let liked = new Set<string>()
  let shared = new Set<string>()
  if (userId && ids.length > 0) {
    const [likes, shares] = await Promise.all([
      supabase.from('likes').select('post_id').eq('user_id', userId).in('post_id', ids),
      supabase.from('shares').select('post_id').eq('user_id', userId).in('post_id', ids),
    ])
    if (likes.error) throw likes.error
    if (shares.error) throw shares.error
    liked = new Set(likes.data.map((row) => row.post_id))
    shared = new Set(shares.data.map((row) => row.post_id))
  }

  return rows.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    author: feedUserFromRow(row.author),
    caption: row.caption,
    photoPaths: row.photos,
    photoUrls: row.photos.map((path) => photoUrl(path)),
    aspect: row.aspect,
    seasons: row.seasons as Season[],
    outfit: row.outfit ? outfitFromRow(row.outfit) : undefined,
    createdAt: new Date(row.created_at),
    likes: row.likes[0]?.count ?? 0,
    likedByMe: liked.has(row.id),
    sharedByMe: shared.has(row.id),
    commentCount: row.comments[0]?.count ?? 0,
  }))
}

function nextOffset(last: PostsPage, pages: PostsPage[]) {
  const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
  return loaded < last.total ? loaded : undefined
}

function paged(query: { data?: InfiniteData<PostsPage>; isPending: boolean; isFetchingNextPage: boolean; fetchNextPage: () => unknown }) {
  return {
    posts: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isPending: query.isPending,
    loadMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage()
    },
  }
}

// Cambia una publicacion en todas las listas donde aparezca (feed, destacados, perfiles)
function updatePost(queryClient: QueryClient, id: string, change: (post: Post) => Post) {
  queryClient.setQueriesData<InfiniteData<PostsPage> | Post[]>({ queryKey: ['posts'] }, (data) => {
    if (!data) return data
    if (Array.isArray(data)) return data.map((post) => (post.id === id ? change(post) : post))
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((post) => (post.id === id ? change(post) : post)),
      })),
    }
  })
}

// Personas que marcaste con "No me interesa"
async function fetchHiddenAuthors() {
  const { data, error } = await supabase.from('feed_hidden_users').select('hidden_id')
  if (error) throw error
  return data.map((row) => row.hidden_id)
}

type FeedFilters = { following: boolean; seasons: Season[] }

// Feed: lo mas nuevo primero, de 12 en 12. "Siguiendo" solo trae a quienes sigues
export function useFeed({ following, seasons }: FeedFilters) {
  const userId = useSession()?.user.id
  const query = useInfiniteQuery({
    queryKey: ['posts', 'feed', userId, following, [...seasons].sort()],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PostsPage> => {
      let request = supabase
        .from('posts')
        .select(POST_COLUMNS, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (seasons.length > 0) request = request.overlaps('seasons', seasons)
      const hidden = userId ? await fetchHiddenAuthors() : []
      if (hidden.length > 0) request = request.not('author_id', 'in', `(${hidden.join(',')})`)
      if (following) {
        const { data: follows, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId!)
        if (error) throw error
        if (follows.length === 0) return { items: [], total: 0 }
        request = request.in(
          'author_id',
          follows.map((row) => row.following_id),
        )
      }
      const { data, error, count } = await request
      if (error) throw error
      return { items: await toPosts(data as PostRow[], userId), total: count ?? 0 }
    },
    getNextPageParam: nextOffset,
  })
  return paged(query)
}

// Publicaciones de una persona para su perfil
export function useUserPosts(authorId: string) {
  const userId = useSession()?.user.id
  const query = useInfiniteQuery({
    queryKey: ['posts', 'user', authorId, userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PostsPage> => {
      const { data, error, count } = await supabase
        .from('posts')
        .select(POST_COLUMNS, { count: 'exact' })
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (error) throw error
      return { items: await toPosts(data as PostRow[], userId), total: count ?? 0 }
    },
    getNextPageParam: nextOffset,
  })
  return paged(query)
}

// Lo que una persona compartio en su perfil, lo ultimo que compartio primero
export function useSharedPosts(sharerId: string) {
  const userId = useSession()?.user.id
  const query = useInfiniteQuery({
    queryKey: ['posts', 'shared', sharerId, userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PostsPage> => {
      const { data, error, count } = await supabase
        .from('shares')
        .select(`post:posts(${POST_COLUMNS})`, { count: 'exact' })
        .eq('user_id', sharerId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (error) throw error
      const rows = (data as unknown as { post: PostRow }[]).map((row) => row.post)
      return { items: await toPosts(rows, userId), total: count ?? 0 }
    },
    getNextPageParam: nextOffset,
  })
  return paged(query)
}

// Una publicacion por su id (link compartido o tarjeta de un chat); null si ya no existe
export function usePost(id: string | undefined) {
  const userId = useSession()?.user.id
  return useQuery({
    queryKey: ['posts', 'one', id, userId],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('posts').select(POST_COLUMNS).eq('id', id!).maybeSingle()
      if (error) throw error
      return data ? (await toPosts([data as unknown as PostRow], userId))[0] : null
    },
  })
}

// Las 4 publicaciones con mas likes y comentarios; la seleccion cambia cada hora
export function useFeaturedPosts() {
  const userId = useSession()?.user.id
  const [now, setNow] = useState(Date.now)
  const hour = Math.floor(now / HOUR_MS)

  // Lee el reloj real cada segundo (y al volver a la pestana) para el contador de renovacion
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  const { data } = useQuery({
    queryKey: ['posts', 'featured', userId, hour],
    staleTime: HOUR_MS,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('featured_posts', { how_many: 4 }).select(POST_COLUMNS)
      if (error) throw error
      const [posts, hidden] = await Promise.all([
        toPosts(data as unknown as PostRow[], userId),
        userId ? fetchHiddenAuthors() : ([] as string[]),
      ])
      // Solo las que tienen al menos un like o comentario, y no de personas que ocultaste
      return posts.filter((post) => post.likes + post.commentCount > 0 && !hidden.includes(post.authorId))
    },
  })

  return {
    featured: data ?? [],
    secondsRemaining: Math.ceil(((hour + 1) * HOUR_MS - now) / 1000),
  }
}

// Like optimista: el corazon cambia al instante en todas las listas y regresa si falla
export function useToggleLike() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async (post: Post) => {
      const { error } = post.likedByMe
        ? await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', userId!)
        : await supabase.from('likes').insert({ post_id: post.id })
      if (error) throw error
    },
    onMutate: (post) =>
      updatePost(queryClient, post.id, (p) => ({
        ...p,
        likedByMe: !post.likedByMe,
        likes: p.likes + (post.likedByMe ? -1 : 1),
      })),
    onError: (_error, post) =>
      updatePost(queryClient, post.id, (p) => ({ ...p, likedByMe: post.likedByMe, likes: post.likes })),
  }).mutate
}

// Compartir en tu perfil (o quitarlo): se marca al instante y la pestana Compartidos se actualiza
export function useToggleShare() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async (post: Post) => {
      const { error } = post.sharedByMe
        ? await supabase.from('shares').delete().eq('post_id', post.id).eq('user_id', userId!)
        : await supabase.from('shares').insert({ post_id: post.id })
      if (error) throw error
    },
    onMutate: (post) => updatePost(queryClient, post.id, (p) => ({ ...p, sharedByMe: !post.sharedByMe })),
    onError: (_error, post) => updatePost(queryClient, post.id, (p) => ({ ...p, sharedByMe: post.sharedByMe })),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['posts', 'shared'] }),
  }).mutate
}

// Ancho entre alto de una foto, para que la cuadricula respete su forma
async function photoAspect(file: File) {
  try {
    const bitmap = await createImageBitmap(file)
    const aspect = bitmap.width / bitmap.height
    bitmap.close()
    return Math.min(5, Math.max(0.2, aspect))
  } catch {
    return 0.8
  }
}

export type NewPost = { photos: File[]; caption: string; seasons: Season[]; outfitId?: string }

export function useCreatePost() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async ({ photos, caption, seasons, outfitId }: NewPost) => {
      // Solo el outfit, sin fotos: en la cuadricula se ve con forma vertical, como el tablero
      const [paths, aspect] = await Promise.all([
        savePhotos(photos, userId!),
        photos[0] ? photoAspect(photos[0]) : 0.75,
      ])
      const { error } = await supabase
        .from('posts')
        .insert({ photos: paths, caption: caption.trim(), seasons, aspect, outfit_id: outfitId ?? null })
      if (error) {
        deletePhotos(paths).catch(() => {})
        throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

// Borra tu publicacion con sus fotos; sus likes, comentarios y compartidos se van con ella
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (post: Post) => {
      const { error } = await supabase.from('posts').delete().eq('id', post.id)
      if (error) throw error
      deletePhotos(post.photoPaths).catch(() => {})
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

type CommentRow = Tables<'comments'> & { author: ProfileBits; reply_to: { username: string } | null }

// Comentarios de una publicacion, del mas viejo al mas nuevo.
// ponytail: se traen todos al abrir la publicacion; paginar si un post junta cientos
export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<PostComment[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select(
          '*, author:profiles!comments_author_id_fkey(username, name, avatar_path), reply_to:profiles!comments_reply_to_id_fkey(username)',
        )
        .eq('post_id', postId)
        .order('created_at')
      if (error) throw error
      return (data as CommentRow[]).map((row) => ({
        id: row.id,
        authorId: row.author_id,
        author: feedUserFromRow(row.author),
        text: row.text,
        imageUrl: row.image_path ? photoUrl(row.image_path) : undefined,
        createdAt: new Date(row.created_at),
        reply:
          row.parent_id && row.reply_to_id
            ? { parentId: row.parent_id, toUserId: row.reply_to_id, toUsername: row.reply_to?.username ?? '' }
            : undefined,
      }))
    },
  })
}

type NewComment = { postId: string; text: string; reply?: PostComment['reply']; image?: File }

export function useAddComment() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async ({ postId, text, reply, image }: NewComment) => {
      // La foto se comprime y sube primero (los GIF van tal cual)
      const imagePath = image ? await uploadPhoto(image, userId!) : null
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        text: text.trim(),
        image_path: imagePath,
        parent_id: reply?.parentId ?? null,
        reply_to_id: reply?.toUserId ?? null,
      })
      if (error) {
        if (imagePath) deletePhotos([imagePath]).catch(() => {})
        throw error
      }
    },
    // El contador sube al instante; la lista se vuelve a pedir al terminar
    onMutate: ({ postId }) => updatePost(queryClient, postId, (p) => ({ ...p, commentCount: p.commentCount + 1 })),
    onError: (_error, { postId }) =>
      updatePost(queryClient, postId, (p) => ({ ...p, commentCount: p.commentCount - 1 })),
    onSettled: (_data, _error, { postId }) => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  }).mutate
}

// "No me interesa": oculta (o vuelve a mostrar) las publicaciones de una persona en tu feed
export function useToggleHiddenAuthor() {
  const queryClient = useQueryClient()
  const userId = useSession()?.user.id

  return useMutation({
    mutationFn: async ({ authorId, hidden }: { authorId: string; hidden: boolean }) => {
      const { error } = hidden
        ? await supabase.from('feed_hidden_users').insert({ hidden_id: authorId })
        : await supabase.from('feed_hidden_users').delete().eq('user_id', userId!).eq('hidden_id', authorId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'featured'] })
    },
  })
}
