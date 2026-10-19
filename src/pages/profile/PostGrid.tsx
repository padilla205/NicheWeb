import { Layers } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import type { Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { PostPhoto } from '@/pages/feed/PostPhoto'
import { EmptyTab } from './EmptyTab'
import { PostDetail } from './PostDetail'

// Cuadricula de publicaciones del perfil (las tuyas o las que compartiste); al tocar una se abre completa
export function PostGrid({ posts, emptyText }: { posts: Post[]; emptyText: string }) {
  const [openId, setOpenId] = useState<string | null>(null)
  // Al cerrar, el cuadro se vuelve a crear sin "layoutId": la ventana ya no tiene a donde regresar
  // y solo se desvanece donde esta, sin la animacion de regreso al cuadro
  const [closingId, setClosingId] = useState<string | null>(null)
  // Cuenta las aperturas: cada una crea una ventana nueva, aunque la anterior aun se este desvaneciendo
  const [openCount, setOpenCount] = useState(0)
  const openPost = posts.find((post) => post.id === openId)
  // Paso 1: el cuadro se vuelve a crear sin enlace con la ventana
  const close = useCallback(() => setClosingId(openId), [openId])
  // Paso 2 (en el siguiente cuadro): quita la ventana, que solo se desvanece
  useEffect(() => {
    if (!closingId || closingId !== openId) return
    const frame = requestAnimationFrame(() => setOpenId(null))
    return () => cancelAnimationFrame(frame)
  }, [closingId, openId])

  if (posts.length === 0) return <EmptyTab>{emptyText}</EmptyTab>

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => {
          const open = post.id === openId
          const linked = post.id !== closingId
          return (
            // Mientras esta abierta, su cuadro se queda escondido (la ventana "sale" de el)
            // key distinta mientras se cierra: React crea un cuadro nuevo, sin el enlace anterior
            <li key={linked ? post.id : `${post.id}-cerrando`} className={cn('grid', open && 'pointer-events-none opacity-0')}>
              {/* El mismo "layoutId" aqui y en el detalle hace que el cuadro crezca hasta abrirse */}
              <motion.button
                type="button"
                layoutId={linked ? `profile-post-${post.id}` : undefined}
                onClick={() => {
                  // Si se toca mientras se cerraba, se cancela el cierre y se vuelve a abrir
                  setClosingId(null)
                  setOpenId(post.id)
                  setOpenCount((count) => count + 1)
                }}
                aria-label={`Ver publicacion de ${post.author.username}`}
                // Al presionarla se encoge un poquito para sentir que el toque se registro
                whileTap={{ scale: 0.97 }}
                style={{ borderRadius: 16 }}
                className="relative flex aspect-[4/5] items-end overflow-hidden text-left outline outline-1 -outline-offset-1 outline-black/10 focus-visible:ring-3 focus-visible:ring-ring/50 dark:outline-white/10"
              >
                <motion.div
                  layoutId={linked ? `profile-post-photo-${post.id}` : undefined}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})` }}
                >
                  <PostPhoto post={post} iconClassName="size-10" />
                </motion.div>
                {/* Marca de que la publicacion tiene varias fotos */}
                {post.photoUrls.length > 1 && (
                  <Layers className="absolute top-2 right-2 size-4 text-white drop-shadow" aria-label="Varias fotos" />
                )}
                {/* Sombra oscura mas alta y firme abajo, para que el texto se lea sobre fotos claras */}
                <p className="relative w-full truncate bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pt-12 pb-2.5 text-xs text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]">
                  <span className="font-medium">{post.author.username}</span> {post.caption}
                </p>
              </motion.button>
            </li>
          )
        })}
      </ul>
      {/* El cuadro no recupera su enlace al terminar de cerrar (eso haria que "creciera" desde la
          ventana ya cerrada); lo recupera hasta que se vuelve a tocar */}
      <AnimatePresence>
        {openPost && (
          <PostDetail key={`${openPost.id}-${openCount}`} post={openPost} onClose={close} />
        )}
      </AnimatePresence>
    </>
  )
}
