import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { type ListingRow, listingFromRow } from '@/hooks/useListings'
import { feedUserFromRow, POST_COLUMNS, type PostRow, toPosts } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'

// Cuantos resultados de cada tipo
const PEOPLE = 8
const LISTINGS = 8
const POSTS = 12

// Texto listo para buscar: sin los simbolos que usa la sintaxis de los filtros de Supabase
export function cleanSearch(text: string) {
  return text.replace(/[,()*%\\.:]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Busca personas (usuario o nombre), ventas (con el buscador del marketplace) y publicaciones (su texto).
// Mientras llega la busqueda nueva se siguen viendo los resultados anteriores
export function useSearch(text: string) {
  const userId = useSession()?.user.id
  const term = cleanSearch(text)

  return useQuery({
    queryKey: ['search', term, userId],
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const [people, listings, posts] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, name, avatar_path')
          .or(`username.ilike.*${term}*,name.ilike.*${term}*`)
          .limit(PEOPLE),
        supabase.rpc('search_listings', { search: term, page_offset: 0, page_limit: LISTINGS, sort: 'recientes' }),
        supabase
          .from('posts')
          .select(POST_COLUMNS)
          .ilike('caption', `%${term}%`)
          .order('created_at', { ascending: false })
          .limit(POSTS),
      ])
      if (people.error) throw people.error
      if (listings.error) throw listings.error
      if (posts.error) throw posts.error
      return {
        people: people.data.map((row) => ({ id: row.id, ...feedUserFromRow(row) })),
        listings: (listings.data as { items: ListingRow[] }).items.map(listingFromRow),
        posts: await toPosts(posts.data as unknown as PostRow[], userId),
      }
    },
  })
}
