import { ArrowUp, X } from 'lucide-react'
import { motion } from 'motion/react'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useAddComment } from '@/hooks/usePosts'
import { formatTimeAgo, type Post } from '@/lib/feed'
import { UserAvatar } from './UserAvatar'

type CommentsDialogProps = {
  post: Post
  onClose: () => void
}

// El cuadro se ve solido desde el primer instante (sin desvanecerse): solo se mueve y crece.
// En escritorio sube un poco mientras crece; en el celular sube desde abajo de la pantalla
const openSpring = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const
const desktopMotion = {
  initial: { y: 24, scale: 0.95 },
  animate: { y: 0, scale: 1, transition: openSpring },
  // Al cerrar basta algo corto y suave
  exit: { y: 8, opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } },
} as const
const mobileMotion = {
  initial: { y: '100%' },
  animate: { y: 0, transition: openSpring },
  exit: { y: '100%', transition: { duration: 0.2, ease: 'easeOut' } },
} as const

export function CommentsDialog({ post, onClose }: CommentsDialogProps) {
  // Se decide una sola vez al abrir; no hace falta seguir el tamano de la ventana mientras esta abierto
  const [isDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  const count = post.comments.length

  useModalBehavior(onClose)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-2 md:items-center md:p-4">
        <motion.div
          {...(isDesktop ? desktopMotion : mobileMotion)}
          role="dialog"
          aria-modal
          aria-labelledby={`comments-title-${post.id}`}
          className="pointer-events-auto flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground md:max-h-[70dvh] md:max-w-md"
        >
          <header className="flex items-center justify-between border-b py-2 pr-2 pl-4">
            <h2 id={`comments-title-${post.id}`} className="text-sm font-medium">
              Comentarios <span className="text-muted-foreground tabular-nums">{count}</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar comentarios">
              <X />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {count === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aun no hay comentarios. Se el primero.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    <UserAvatar user={comment.author} />
                    <div className="min-w-0 text-sm">
                      <p>
                        <span className="font-medium">{comment.author.username}</span>{' '}
                        <span className="text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                      </p>
                      <p className="break-words">{comment.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t p-3">
            {/* En el celular no se enfoca solo, para que el teclado no tape los comentarios al abrir */}
            <CommentForm postId={post.id} autoFocus={isDesktop} />
          </div>
        </motion.div>
      </div>
    </>
  )
}

function CommentForm({ postId, autoFocus }: { postId: string; autoFocus: boolean }) {
  const [text, setText] = useState('')
  const addComment = useAddComment()
  const canSend = text.trim() !== ''

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return
    addComment(postId, text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Escribe un comentario..."
        aria-label="Escribe un comentario"
        autoFocus={autoFocus}
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Enviar comentario">
        <ArrowUp />
      </Button>
    </form>
  )
}
