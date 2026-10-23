import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/useProfile'
import type { ClosetItem, ClothingType, Season } from '@/lib/clothing'
import type { Tables } from '@/lib/database.types'
import { deletePhotos, photoUrl, uploadPhoto } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// Prendas por bloque antes de "Ver mas"
const PAGE_SIZE = 20

export type NewItem = {
  photos: File[]
  name: string
  type: ClothingType
  seasons: Season[]
  colors: string[]
  team?: string
}

type ItemsPage = { items: ClosetItem[]; total: number }

// Fila de la base de datos -> lo que usan las pantallas
export function itemFromRow(row: Tables<'items'>): ClosetItem {
  return {
    id: row.id,
    photoPaths: row.photos,
    photoUrls: row.photos.map((path) => photoUrl(path)),
    // La cuadricula usa la version chica de la portada
    thumbUrl: row.photos[0] ? photoUrl(row.photos[0], true) : '',
    name: row.name,
    type: row.type as ClothingType,
    seasons: row.seasons as Season[],
    colors: row.colors,
    team: row.team ?? undefined,
    private: row.is_private,
    createdAt: new Date(row.created_at),
  }
}

// Prendas de un closet, las mas nuevas primero, de 20 en 20. Con tipos elegidos, solo esos tipos.
// Sin ownerId es tu closet; el de otra persona solo trae sus prendas visibles (lo decide RLS)
export function useItems(types: ClothingType[] = [], ownerId?: string) {
  const { id: myId } = useProfile()
  const userId = ownerId ?? myId
  const query = useInfiniteQuery({
    queryKey: ['items', userId, [...types].sort()],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ItemsPage> => {
      let request = supabase
        .from('items')
        .select('*', { count: 'exact' })
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (types.length > 0) request = request.in('type', types)
      const { data, error, count } = await request
      if (error) throw error
      return { items: data.map(itemFromRow), total: count ?? 0 }
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
  })

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isPending: query.isPending,
    loadMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage()
    },
  }
}

// Todas tus prendas de una vez, para el generador de outfits (que necesita ver el closet completo).
// ponytail: hasta 500 prendas; si alguien junta mas, elegir al azar en la base de datos
export function useAllItems() {
  const { id: userId } = useProfile()
  return useQuery({
    queryKey: ['items', userId, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('items').select('*').eq('owner_id', userId).limit(500)
      if (error) throw error
      return data.map(itemFromRow)
    },
  })
}

export function useAddItem() {
  const queryClient = useQueryClient()
  const { id: userId } = useProfile()

  return useMutation({
    mutationFn: async (item: NewItem) => {
      // Primero se comprimen y suben las fotos; si la prenda no se guarda, se borran
      const paths = await Promise.all(item.photos.map((photo) => uploadPhoto(photo, userId)))
      const { error } = await supabase.from('items').insert({
        photos: paths,
        name: item.name.trim(),
        type: item.type,
        seasons: item.seasons,
        colors: item.colors,
        team: item.team ?? null,
      })
      if (error) {
        deletePhotos(paths).catch(() => {})
        throw error
      }
    },
    // Vuelve a pedir la primera pagina para que la prenda nueva salga hasta arriba
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', userId] }),
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  const { id: userId } = useProfile()

  return useMutation({
    mutationFn: async (item: ClosetItem) => {
      const { error } = await supabase.from('items').delete().eq('id', item.id)
      if (error) throw error
      // Si las fotos no se pueden borrar no pasa nada grave: la prenda ya no existe
      deletePhotos(item.photoPaths).catch(() => {})
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items', userId] }),
  })
}

export function useSetItemPrivate() {
  const queryClient = useQueryClient()
  const { id: userId } = useProfile()
  const key = ['items', userId]

  // Cambia la prenda en todas las listas guardadas (con y sin filtros)
  function patch(id: string, isPrivate: boolean) {
    queryClient.setQueriesData<InfiniteData<ItemsPage>>({ queryKey: key }, (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((item) => (item.id === id ? { ...item, private: isPrivate } : item)),
        })),
      },
    )
  }

  const mutation = useMutation({
    mutationFn: async ({ id, isPrivate }: { id: string; isPrivate: boolean }) => {
      const { error } = await supabase.from('items').update({ is_private: isPrivate }).eq('id', id)
      if (error) throw error
    },
    // Optimista: el candado cambia al instante y regresa si Supabase lo rechaza
    onMutate: async ({ id, isPrivate }) => {
      await queryClient.cancelQueries({ queryKey: key })
      patch(id, isPrivate)
    },
    onError: (_error, { id, isPrivate }) => patch(id, !isPrivate),
  })

  return (id: string, isPrivate: boolean) => mutation.mutate({ id, isPrivate })
}
