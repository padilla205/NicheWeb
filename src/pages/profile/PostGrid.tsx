import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import type { Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { PostPhoto } from '@/pages/feed/PostPhoto'
import { EmptyTab } from './EmptyTab'
import { PostDetail } from './PostDetail'

// Cuadricula de publicaciones del perfil (las tuyas o las que compartiste); al tocar una se abre completa
export function PostGrid({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  const [openId, setOpenId] = useState<string | null>(null)
  // La ultima abierta se queda por encima hasta que termina de regresar a su lugar
  const [raisedId, setRaisedId] = useState<string | null>(null)
  const openPost = posts.find((post) => post.id === openId)
  const close = useCallback(() => setOpenId(null), [])

  if (posts.length === 0) return <EmptyTab>{emptyText}</EmptyTab>

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => {
          const open = post.id === openId
          return (
            // Mientras esta abierta, su cuadro se queda escondido (la ventana "sale" de el)
            <li key={post.id} className={cn('grid', open && 'pointer-events-none opacity-0')}>
              {/* El mismo "layoutId" aqui y en el detalle hace que el cuadro crezca hasta abrirse */}
              <motion.button
                type="button"
                layoutId={`profile-post-${post.id}`}
                onClick={() => {
                  setOpenId(post.id)
                  setRaisedId(post.id)
                }}
                onLayoutAnimationComplete={() => {
                  if (!open && raisedId === post.id) setRaisedId(null)
                }}
                aria-label={`Ver publicacion de ${post.author.username}`}
                style={{ borderRadius: 16, zIndex: raisedId === post.id ? 60 : undefined }}
                className="relative flex aspect-[4/5] items-end overflow-hidden text-left outline outline-1 -outline-offset-1 outline-black/10 focus-visible:ring-3 focus-visible:ring-ring/50 dark:outline-white/10"
              >
                <motion.div
                  layoutId={`profile-post-photo-${post.id}`}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
                >
                  <PostPhoto post={post} iconClassName="size-10" />
                </motion.div>
                <p className="relative w-full truncate bg-gradient-to-t from-black/50 to-transparent px-3 pt-6 pb-2 text-xs text-white">
                  <span className="font-medium">{post.author.username}</span> {post.caption}
                </p>
              </motion.button>
            </li>
          )
        })}
      </ul>
      <AnimatePresence>
        {openPost && <PostDetail key={openPost.id} post={openPost} onClose={close} />}
      </AnimatePresence>
    </>
  )
}
