import { ArrowUp, X } from 'lucide-react'
import { motion } from 'motion/react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useAddComment } from '@/hooks/usePosts'
import { formatTimeAgo, type Post, type PostComment } from '@/lib/feed'
import { UserAvatar } from './UserAvatar'

type Reply = NonNullable<PostComment['reply']>

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
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null)

  // Las respuestas se muestran debajo de su comentario principal, no en la lista general
  const topLevel = post.comments.filter((comment) => !comment.reply)
  const repliesOf = (parentId: string) => post.comments.filter((comment) => comment.reply?.parentId === parentId)

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
                {topLevel.map((comment) => {
                  const replies = repliesOf(comment.id)
                  return (
                    <li key={comment.id}>
                      <CommentItem
                        comment={comment}
                        onReply={() => setReplyingTo({ parentId: comment.id, toUsername: comment.author.username })}
                      />
                      {replies.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-3 pl-11">
                          {replies.map((reply) => (
                            <li key={reply.id}>
                              {/* Responder a una respuesta la deja en el mismo hilo, mencionando a su autor */}
                              <CommentItem
                                comment={reply}
                                small
                                onReply={() =>
                                  setReplyingTo({ parentId: comment.id, toUsername: reply.author.username })
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="border-t p-3">
            {/* En el celular no se enfoca solo, para que el teclado no tape los comentarios al abrir */}
            <CommentForm
              postId={post.id}
              autoFocus={isDesktop}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
        </motion.div>
      </div>
    </>
  )
}

type CommentItemProps = {
  comment: PostComment
  onReply: () => void
  // Las respuestas usan un avatar mas chico para que se note que van dentro de un hilo
  small?: boolean
}

function CommentItem({ comment, onReply, small = false }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <UserAvatar user={comment.author} className={small ? 'size-6 text-[10px]' : undefined} />
      <div className="min-w-0 text-sm">
        <p>
          <span className="font-medium">{comment.author.username}</span>{' '}
          <span className="text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
        </p>
        <p className="break-words">
          {comment.reply && <span className="font-medium text-primary">@{comment.reply.toUsername} </span>}
          {comment.text}
        </p>
        <button
          type="button"
          onClick={onReply}
          className="mt-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Responder
        </button>
      </div>
    </div>
  )
}

type CommentFormProps = {
  postId: string
  autoFocus: boolean
  replyingTo: Reply | null
  onCancelReply: () => void
}

function CommentForm({ postId, autoFocus, replyingTo, onCancelReply }: CommentFormProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addComment = useAddComment()
  const canSend = text.trim() !== ''

  // Al tocar "Responder" el cursor salta al cuadro de texto para escribir de inmediato
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus()
  }, [replyingTo])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return
    addComment(postId, text, replyingTo ?? undefined)
    setText('')
    onCancelReply()
  }

  return (
    <div className="flex flex-col gap-2">
      {replyingTo && (
        <div className="flex items-center justify-between pl-1 text-xs text-muted-foreground">
          <span>
            Respondiendo a <span className="font-medium text-foreground">@{replyingTo.toUsername}</span>
          </span>
          <Button variant="ghost" size="icon" className="size-6" onClick={onCancelReply} aria-label="Cancelar respuesta">
            <X />
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={replyingTo ? `Responde a @${replyingTo.toUsername}...` : 'Escribe un comentario...'}
          aria-label={replyingTo ? `Responde a ${replyingTo.toUsername}` : 'Escribe un comentario'}
          autoFocus={autoFocus}
        />
        <Button type="submit" size="icon" disabled={!canSend} aria-label="Enviar comentario">
          <ArrowUp />
        </Button>
      </form>
    </div>
  )
}
