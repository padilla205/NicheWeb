import { useQuery } from '@tanstack/react-query'
import { photoUrl } from '@/lib/photos'
import { supabase } from '@/lib/supabase'

export type ShowcasePhoto = { id: string; title: string; src: string; link?: string }

// Fotos para la pagina de bienvenida: la primera foto de las ventas activas y de las publicaciones
// recientes. Se puede leer sin cuenta (RLS solo deja ver lo publico)
export function useShowcasePhotos() {
  return useQuery({
    queryKey: ['showcase-photos'],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<ShowcasePhoto[]> => {
      const [listings, posts] = await Promise.all([
        supabase.from('listings').select('id, title, photos').order('created_at', { ascending: false }).limit(15),
        supabase.from('posts').select('id, caption, photos').order('created_at', { ascending: false }).limit(15),
      ])
      if (listings.error) throw listings.error
      if (posts.error) throw posts.error
      const fromListings = listings.data
        .filter((row) => row.photos?.length)
        .map((row) => ({ id: `l-${row.id}`, title: row.title, src: photoUrl(row.photos[0]), link: `/marketplace/${row.id}` }))
      const fromPosts = posts.data
        .filter((row) => row.photos?.length)
        .map((row) => ({ id: `p-${row.id}`, title: row.caption || 'Outfit de la comunidad', src: photoUrl(row.photos[0]) }))
      return [...fromListings, ...fromPosts]
    },
  })
}
