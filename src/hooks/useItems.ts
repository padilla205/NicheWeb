import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/hooks/useProfile'
import {
  type ClosetFilterValue,
  type ClosetItem,
  type ClothingType,
  clothingColors,
  clothingZones,
  emptyClosetFilters,
  type Season,
} from '@/lib/clothing'
import type { Tables } from '@/lib/database.types'
import { deletePhotos, photoUrl, savePhotos, uploadPhoto } from '@/lib/photos'
import { supabase } from '@/lib/supabase'
import { normalizeText } from '@/lib/text'

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

const allTypes = clothingZones.flatMap<{ value: ClothingType; label: string }>((zone) => [...zone.types])

// Cada palabra de la busqueda tiene que aparecer en el nombre, el tipo de prenda o el color.
// Asi "chamarra negra" encuentra una chamarra de color negro aunque se llame "Mi favorita"
function searchConditions(text: string) {
  return normalizeText(text)
    // Comas, parentesis y comillas romperian el filtro de Supabase
    .replace(/[,()"*%\\]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      const types = allTypes.filter((type) => normalizeText(type.label).includes(word)).map((type) => type.value)
      // ponytail: el color se compara por el principio de la palabra ("negra" -> "Negro", "roja" -> "Rojo");
      // si hace falta mas precision, una lista de sinonimos por color
      const stem = word.slice(0, Math.max(3, word.length - 1))
      const colors =
        word.length >= 3
          ? clothingColors.filter((color) => normalizeText(color.label).startsWith(stem)).map((color) => color.value)
          : []
      return [
        `name.ilike."%${word}%"`,
        ...(types.length > 0 ? [`type.in.(${types.join(',')})`] : []),
        ...(colors.length > 0 ? [`colors.ov.{${colors.join(',')}}`] : []),
      ].join(',')
    })
}

// Prendas de un closet, las mas nuevas primero, de 20 en 20, con los filtros que elijas.
// Sin ownerId es tu closet; el de otra persona solo trae sus prendas visibles (lo decide RLS)
export function useItems(filters: ClosetFilterValue = emptyClosetFilters, ownerId?: string) {
  const { id: myId } = useProfile()
  const userId = ownerId ?? myId
  const query = useInfiniteQuery({
    queryKey: ['items', userId, filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ItemsPage> => {
      let request = supabase
        .from('items')
        .select('*', { count: 'exact' })
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (filters.types.length > 0) request = request.in('type', filters.types)
      if (filters.colors.length > 0) request = request.overlaps('colors', filters.colors)
      if (filters.seasons.length > 0) request = request.overlaps('seasons', filters.seasons)
      if (filters.visibility !== 'todas') request = request.eq('is_private', filters.visibility === 'privadas')
      for (const condition of searchConditions(filters.query)) request = request.or(condition)
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

// Una prenda por su id (tarjeta de un chat); null si ya no existe o no se puede ver
export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: ['items', 'one', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('items').select('*').eq('id', id!).maybeSingle()
      if (error) throw error
      return data ? { item: itemFromRow(data), ownerId: data.owner_id } : null
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

// Guarda los cambios de una prenda. Las fotos que ya tenia se conservan; solo se suben las nuevas
export function useUpdateItem() {
  const queryClient = useQueryClient()
  const { id: userId } = useProfile()

  return useMutation({
    mutationFn: async ({ item, changes }: { item: ClosetItem; changes: NewItem }) => {
      const paths = await savePhotos(changes.photos, userId, item.photoPaths)
      const { error } = await supabase
        .from('items')
        .update({
          photos: paths,
          name: changes.name.trim(),
          type: changes.type,
          seasons: changes.seasons,
          colors: changes.colors,
          team: changes.team ?? null,
        })
        .eq('id', item.id)
      if (error) {
        deletePhotos(paths.filter((path) => !item.photoPaths.includes(path))).catch(() => {})
        throw error
      }
      // Las fotos que se quitaron ya no se usan
      deletePhotos(item.photoPaths.filter((path) => !paths.includes(path))).catch(() => {})
    },
    // La prenda tambien sale en outfits y publicaciones: todo se vuelve a pedir
    onSuccess: () => {
      for (const list of ['items', 'outfits', 'posts']) queryClient.invalidateQueries({ queryKey: [list] })
    },
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
