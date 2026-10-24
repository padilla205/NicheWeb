import { Shirt, Trash2, X } from 'lucide-react'
import { motion, useIsPresent } from 'motion/react'
import { useState } from 'react'
import { SwipeHandle } from '@/components/SwipeHandle'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useSwipeToClose } from '@/hooks/useSwipeToClose'
import { useSession } from '@/hooks/useAuth'
import { useDeletePost, useToggleLike, useToggleShare } from '@/hooks/usePosts'
import { getTypeInfo } from '@/lib/clothing'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { CommentsThread } from '@/pages/feed/CommentsThread'
import { PostActions } from '@/pages/feed/PostActions'
import { PostPhotos } from '@/pages/feed/PostPhotos'
import { AuthorMenu } from '@/pages/feed/AuthorMenu'

// Al cerrar, el fondo oscuro, la ventana y su foto desaparecen al instante, sin animacion
const HIDE_NOW = { opacity: 0, transition: { duration: 0 } } as const

type PostDetailProps = {
  post: Post
  onClose: () => void
  // Despues de "No me interesa" en el menu del autor
  onAuthorHidden?: () => void
  // Sin tarjeta de donde crecer (por ejemplo, abierta desde Destacados): solo aparece
  morph?: boolean
}

// Publicacion completa: foto, autor, descripcion, likes y comentarios
export function PostDetail({ post, onClose, onAuthorHidden, morph = true }: PostDetailProps) {
  // Se decide una sola vez al abrir: en el celular el cuadro de comentario no se enfoca solo
  // para que el teclado no tape la publicacion
  const [isDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const toggleLike = useToggleLike()
  const toggleShare = useToggleShare()
  const isMine = useSession()?.user.id === post.authorId
  const deletePost = useDeletePost()
  // Eliminar pide un segundo toque para confirmar
  const [confirmDelete, setConfirmDelete] = useState(false)

  useModalBehavior(onClose)
  // Mientras se esta quitando al cerrarse deja pasar los toques al cuadro de abajo
  const isPresent = useIsPresent()
  const swipe = useSwipeToClose(onClose)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={HIDE_NOW}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        // Solo oscurece el fondo, sin desenfocarlo
        className={cn('fixed inset-0 z-50 bg-black/40', !isPresent && 'pointer-events-none')}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* layoutCrossfade={false}: se ve solido desde el primer instante, sin parpadear */}
        <motion.div
          layoutId={morph ? `profile-post-${post.id}` : undefined}
          layoutCrossfade={false}
          exit={HIDE_NOW}
          {...swipe.panelProps}
          role="dialog"
          aria-modal
          aria-label={`Publicacion de ${post.author.username}`}
          style={{ borderRadius: 16 }}
          className={cn(
            'relative flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-y-auto border bg-popover text-popover-foreground md:h-[min(85dvh,640px)] md:flex-row md:overflow-hidden',
            isPresent ? 'pointer-events-auto' : 'pointer-events-none',
          )}
        >
          <SwipeHandle onPointerDown={swipe.startDrag} />
          <motion.div
            layoutId={morph ? `profile-post-${post.id}-photo` : undefined}
            className="relative flex aspect-[4/5] shrink-0 items-center justify-center bg-muted md:aspect-auto md:h-full md:w-1/2"
          >
            <PostPhotos post={post} carouselId={`profile-post-detail-${post.id}`} iconClassName="size-16" />
          </motion.div>

          {/* "layout" dibuja el texto nitido y a su tamano real mientras la ventana crece y lo va
              descubriendo (sin desvanecerse ni "letras mini"); al cerrar desaparece al instante */}
          <motion.div
            layout
            exit={HIDE_NOW}
            className="flex shrink-0 flex-col md:min-h-0 md:flex-1 md:shrink md:border-l"
          >
            <header className="flex items-center gap-3 border-b p-3 pr-14">
              <AuthorMenu post={post} onHidden={onAuthorHidden ?? onClose} className="text-sm">
                <span className="shrink-0 font-normal text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
              </AuthorMenu>
              {isMine && (
                <Button
                  variant={confirmDelete ? 'destructive' : 'ghost'}
                  size="sm"
                  className={cn('ml-auto shrink-0', !confirmDelete && 'text-destructive hover:text-destructive')}
                  disabled={deletePost.isPending}
                  onClick={() => {
                    if (!confirmDelete) return setConfirmDelete(true)
                    deletePost.mutate(post, { onSuccess: onClose })
                  }}
                  onBlur={() => setConfirmDelete(false)}
                >
                  <Trash2 />
                  {deletePost.isPending ? 'Eliminando' : confirmDelete ? 'Toca otra vez' : 'Eliminar'}
                </Button>
              )}
            </header>

            {post.caption && (
              <p className="border-b p-4 text-sm">
                <span className="font-medium">{post.author.username}</span> {post.caption}
              </p>
            )}

            {post.outfit && post.outfit.items.length > 0 && (
              <section aria-label="Prendas del outfit" className="flex flex-col gap-2 border-b p-4">
                <h3 className="text-xs font-medium text-muted-foreground">Prendas del outfit</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {post.outfit.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-1.5 rounded-full border bg-muted/40 py-1 pr-2.5 pl-1 text-xs">
                      {item.thumbUrl ? (
                        <img src={item.thumbUrl} alt="" loading="lazy" className="size-6 rounded-full object-cover" />
                      ) : (
                        <Shirt className="size-3.5 text-muted-foreground" />
                      )}
                      {item.name || getTypeInfo(item.type).label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="border-b p-2.5">
              {/* El boton de comentar lleva al cuadro de texto de abajo */}
              <PostActions
                post={post}
                onLike={() => toggleLike(post)}
                onComment={() => document.getElementById(`comment-input-${post.id}`)?.focus()}
                onShareToProfile={() => toggleShare(post)}
              />
            </div>

            <CommentsThread post={post} autoFocus={isDesktop} />
          </motion.div>

          <motion.div
            layout
            exit={HIDE_NOW}
            className="absolute top-2 right-2"
          >
            <Button variant="secondary" size="icon-sm" onClick={onClose}>
              <X />
              <span className="sr-only">Cerrar</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
