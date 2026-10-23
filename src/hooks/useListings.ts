import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import type { Season } from '@/lib/clothing'
import type { Tables } from '@/lib/database.types'
import type { FeedUser } from '@/lib/feed'
import type { UserLocation } from '@/lib/locations'
import type {
  Delivery,
  Listing,
  ListingCondition,
  ListingFilters,
  ListingSort,
  ListingStatus,
} from '@/lib/marketplace'
import { deletePhotos, photoUrl, savePhotos } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

// Ventas por bloque antes de "Ver mas"
const PAGE_SIZE = 12

export type NewListing = {
  photos: File[]
  title: string
  price: number
  size: string
  location: UserLocation
  delivery?: Delivery
  condition: ListingCondition
  type: string
  seasons: Season[]
  colors: string[]
  team?: string
  description: string
}

type ListingRow = Tables<'listings'> & { seller: FeedUser }
type ListingsPage = { items: Listing[]; total: number }

// Fila de la base de datos (con su vendedor) -> lo que usan las pantallas
function fromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    seller: row.seller,
    sellerId: row.seller_id,
    title: row.title,
    price: row.price,
    size: row.size,
    location: { country: row.country, city: row.city },
    delivery:
      row.delivery_lat !== null && row.delivery_lng !== null
        ? { lat: row.delivery_lat, lng: row.delivery_lng, radiusKm: row.delivery_radius_km ?? undefined }
        : undefined,
    condition: row.condition as ListingCondition,
    status: row.status as ListingStatus,
    type: row.type,
    seasons: row.seasons as Season[],
    colors: row.colors,
    team: row.team ?? undefined,
    description: row.description,
    photoPaths: row.photos,
    photoUrls: row.photos.map((path) => photoUrl(path)),
    thumbUrl: row.photos[0] ? photoUrl(row.photos[0], true) : '',
    createdAt: new Date(row.created_at),
  }
}

// Columnas de la venta mas el usuario y nombre del vendedor. Se nombra la llave (seller_id)
// porque ventas y perfiles tambien se conectan a traves de los chats, y Supabase no sabria cual usar
const WITH_SELLER = '*, seller:profiles!listings_seller_id_fkey(username, name)'

export type ListingSearch = {
  query: string
  filters: ListingFilters
  // Solo ventas de esta ciudad
  onlyCity: UserLocation | null
  sort: ListingSort
  // Tu ubicacion y el centro de tu ciudad, para ordenar por cercania
  near: UserLocation | null
  center: { lat: number; lng: number } | null
}

// Busqueda del marketplace: Supabase filtra, ordena y manda de 12 en 12
export function useListings(search: ListingSearch) {
  const query = useInfiniteQuery({
    queryKey: ['listings', 'search', search],
    // Mientras llega la nueva busqueda se siguen viendo los resultados anteriores
    placeholderData: keepPreviousData,
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ListingsPage> => {
      const { query: text, filters, onlyCity, sort, near, center } = search
      const { data, error } = await supabase.rpc('search_listings', {
        search: text,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        sizes: filters.sizes,
        conditions: filters.conditions,
        colors: filters.colors,
        seasons: filters.seasons,
        only_country: onlyCity?.country,
        only_city: onlyCity?.city,
        near_country: near?.country,
        near_city: near?.city,
        near_lat: center?.lat,
        near_lng: center?.lng,
        sort,
        page_offset: pageParam,
        page_limit: PAGE_SIZE,
      })
      if (error) throw error
      const result = data as { items: ListingRow[]; total: number }
      return { items: result.items.map(fromRow), total: result.total }
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
  })

  return {
    listings: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isPending: query.isPending,
    loadMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage()
    },
  }
}

// Tus ventas para el perfil, incluidas las vendidas (solo tu las ves), de 12 en 12
export function useMyListings() {
  const { id: userId } = useProfile()
  const query = useInfiniteQuery({
    queryKey: ['listings', 'mine', userId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<ListingsPage> => {
      const { data, error, count } = await supabase
        .from('listings')
        .select(WITH_SELLER, { count: 'exact' })
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1)
      if (error) throw error
      return { items: (data as ListingRow[]).map(fromRow), total: count ?? 0 }
    },
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < last.total ? loaded : undefined
    },
  })

  return {
    listings: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    isPending: query.isPending,
    loadMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage()
    },
  }
}

// Una sola venta por su id; null si no existe (o ya se vendio y no es tuya). Funciona sin sesion
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'one', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('listings').select(WITH_SELLER).eq('id', id!).maybeSingle()
      if (error) throw error
      return data ? fromRow(data as ListingRow) : null
    },
  })
}

// Tallas que existen en las ventas, para el filtro
export function useListingSizes() {
  return useQuery({
    queryKey: ['listings', 'sizes'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('listing_sizes')
      if (error) throw error
      return data.sort((a, b) => a.localeCompare(b, 'es', { numeric: true }))
    },
  }).data ?? []
}

// Datos del formulario ya limpios, como columnas de la tabla
function toRow({ title, description, size, type, location, delivery, team, price, condition, seasons, colors }: NewListing) {
  return {
    title: title.trim(),
    description: description.trim(),
    size: size.trim(),
    type: type.trim(),
    price,
    condition,
    seasons,
    colors,
    team: team ?? null,
    country: location.country,
    city: location.city,
    delivery_lat: delivery?.lat ?? null,
    delivery_lng: delivery?.lng ?? null,
    delivery_radius_km: delivery?.radiusKm ?? null,
  }
}

// Despues de publicar, editar o borrar, las listas y la venta se vuelven a pedir
function useRefreshListings() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['listings'] })
}

export function useCreateListing() {
  const userId = useSession()?.user.id
  const refresh = useRefreshListings()

  return useMutation({
    mutationFn: async (data: NewListing) => {
      const paths = await savePhotos(data.photos, userId!)
      const { error } = await supabase.from('listings').insert({ ...toRow(data), photos: paths })
      if (error) {
        deletePhotos(paths).catch(() => {})
        throw error
      }
    },
    onSuccess: refresh,
  })
}

export function useUpdateListing() {
  const userId = useSession()?.user.id
  const refresh = useRefreshListings()

  return useMutation({
    mutationFn: async ({ listing, data }: { listing: Listing; data: NewListing }) => {
      // Las fotos que ya tenia se conservan tal cual; solo se suben las nuevas
      const paths = await savePhotos(data.photos, userId!, listing.photoPaths)
      const { error } = await supabase
        .from('listings')
        .update({ ...toRow(data), photos: paths })
        .eq('id', listing.id)
      if (error) {
        deletePhotos(paths.filter((path) => !listing.photoPaths.includes(path))).catch(() => {})
        throw error
      }
      // Las fotos que se quitaron ya no se usan
      deletePhotos(listing.photoPaths.filter((path) => !paths.includes(path))).catch(() => {})
    },
    onSuccess: refresh,
  })
}

export function useSetListingStatus() {
  const queryClient = useQueryClient()
  const refresh = useRefreshListings()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ListingStatus }) => {
      const { error } = await supabase.from('listings').update({ status }).eq('id', id)
      if (error) throw error
    },
    // Optimista: la etiqueta cambia al instante en la pagina de la venta y regresa si falla
    onMutate: async ({ id, status }) => {
      const key = ['listings', 'one', id]
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Listing | null>(key)
      queryClient.setQueryData<Listing | null>(key, (current) => current && { ...current, status })
      return { previous }
    },
    onError: (_error, { id }, context) => queryClient.setQueryData(['listings', 'one', id], context?.previous),
    onSettled: refresh,
  })
}

export function useDeleteListing() {
  const refresh = useRefreshListings()

  return useMutation({
    mutationFn: async (listing: Listing) => {
      const { error } = await supabase.from('listings').delete().eq('id', listing.id)
      if (error) throw error
      deletePhotos(listing.photoPaths).catch(() => {})
    },
    onSuccess: refresh,
  })
}
