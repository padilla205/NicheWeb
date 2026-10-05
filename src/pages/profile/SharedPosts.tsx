import { Repeat2, Shirt } from 'lucide-react'
import { useSharedPosts } from '@/hooks/usePosts'

// Publicaciones del feed que republicaste en tu perfil
export function SharedPosts() {
  const posts = useSharedPosts()

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <Repeat2 className="size-4" />
        Compartidos <span className="text-muted-foreground tabular-nums">{posts.length}</span>
      </h2>

      {posts.length === 0 ? (
        <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Aun no compartes publicaciones. Usa el boton de compartir en el feed para traerlas aqui.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="relative flex aspect-[4/5] items-end overflow-hidden rounded-2xl outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
            >
              <Shirt
                className="absolute inset-0 m-auto size-10 text-white/70"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="relative w-full truncate bg-gradient-to-t from-black/50 to-transparent px-3 pt-6 pb-2 text-xs text-white">
                <span className="font-medium">{post.author.username}</span> {post.caption}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
