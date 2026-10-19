import { ArrowUp, ImagePlus, X } from 'lucide-react'
import { motion } from 'motion/react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { SwipeHandle } from '@/components/SwipeHandle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useSwipeToClose } from '@/hooks/useSwipeToClose'
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

  useModalBehavior(onClose)
  const swipe = useSwipeToClose(onClose)

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
          {...swipe.panelProps}
          role="dialog"
          aria-modal
          aria-labelledby={`comments-title-${post.id}`}
          className="pointer-events-auto relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground md:max-h-[70dvh] md:max-w-md"
        >
          <SwipeHandle onPointerDown={swipe.startDrag} barClassName="bg-muted-foreground/40" />
          {/* En el celular deja espacio arriba para la agarradera */}
          <header className="flex items-center justify-between border-b pt-5 pr-2 pb-2 pl-4 md:pt-2">
            <h2 id={`comments-title-${post.id}`} className="text-sm font-medium">
              Comentarios <span className="text-muted-foreground tabular-nums">{count}</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar comentarios">
              <X />
            </Button>
          </header>

          {/* En el celular no se enfoca solo, para que el teclado no tape los comentarios al abrir */}
          <CommentsThread post={post} autoFocus={isDesktop} />
        </motion.div>
      </div>
    </>
  )
}

// Lista de comentarios con sus respuestas y el cuadro para escribir; el que la usa pone el contenedor
// (flex en columna) para que la lista se desplace y el cuadro quede abajo
export function CommentsThread({ post, autoFocus }: { post: Post; autoFocus: boolean }) {
  const count = post.comments.length
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null)

  // Las respuestas se muestran debajo de su comentario principal, no en la lista general
  const topLevel = post.comments.filter((comment) => !comment.reply)
  const repliesOf = (parentId: string) => post.comments.filter((comment) => comment.reply?.parentId === parentId)

  return (
    <>
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
        <CommentForm
          postId={post.id}
          autoFocus={autoFocus}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
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
        {(comment.text || comment.reply) && (
          <p className="break-words">
            {comment.reply && <span className="font-medium text-primary">@{comment.reply.toUsername} </span>}
            {comment.text}
          </p>
        )}
        {/* Completa segun sus proporciones, sin pasar de un tamano comodo para leer el hilo */}
        {comment.imageUrl && (
          <img
            src={comment.imageUrl}
            alt={`Imagen de ${comment.author.username}`}
            loading="lazy"
            className="mt-1.5 max-h-60 max-w-full rounded-lg border object-contain"
          />
        )}
        <button
          type="button"
          onClick={onReply}
          className="touch-target relative mt-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
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
  const [image, setImage] = useState<File>()
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const addComment = useAddComment()
  // Se puede mandar solo texto, solo imagen o las dos cosas
  const canSend = text.trim() !== '' || image !== undefined

  // Vista previa de la imagen elegida; se libera al cambiarla o quitarla
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image])
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  // Al tocar "Responder" el cursor salta al cuadro de texto para escribir de inmediato
  useEffect(() => {
    if (replyingTo) inputRef.current?.focus()
  }, [replyingTo])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSend) return
    addComment(postId, text, replyingTo ?? undefined, image)
    setText('')
    setImage(undefined)
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
      {previewUrl && (
        <div className="relative self-start">
          <img src={previewUrl} alt="Imagen para enviar" className="max-h-24 rounded-lg border object-contain" />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="absolute -top-2 -right-2 rounded-full"
            onClick={() => setImage(undefined)}
            aria-label="Quitar imagen"
          >
            <X />
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Fotos y GIFs del dispositivo */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileRef.current?.click()}
          aria-label="Agregar imagen o GIF"
        >
          <ImagePlus />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file?.type.startsWith('image/')) setImage(file)
            // Permite volver a elegir la misma imagen despues de quitarla
            event.target.value = ''
          }}
        />
        <Input
          ref={inputRef}
          id={`comment-input-${postId}`}
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
