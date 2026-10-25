import { ArrowUp, Heart, ImagePlus, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { RollingNumber } from '@/components/RollingNumber'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddComment, useComments, useToggleCommentLike } from '@/hooks/usePosts'
import { formatTimeAgo, type Post, type PostComment } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { ProfileHoverCard } from './ProfileHoverCard'
import { UserAvatar } from './UserAvatar'

type Reply = NonNullable<PostComment['reply']>

// Lista de comentarios con sus respuestas y el cuadro para escribir; el que la usa pone el contenedor
// (flex en columna) para que la lista se desplace y el cuadro quede abajo
export function CommentsThread({ post, autoFocus }: { post: Post; autoFocus: boolean }) {
  const { data: comments, isPending } = useComments(post.id)
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null)
  // Hilos con las respuestas a la vista; los demas solo dicen "Ver N respuestas"
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set())
  const toggleLike = useToggleCommentLike(post.id)
  const setThreadOpen = (id: string, open: boolean) =>
    setOpenThreads((threads) => {
      const next = new Set(threads)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })
  // Al responder se abre el hilo para ver tu respuesta en cuanto llegue
  const reply = (to: Reply) => {
    setReplyingTo(to)
    setThreadOpen(to.parentId, true)
  }

  // Las respuestas se muestran debajo de su comentario principal, no en la lista general
  const topLevel = comments?.filter((comment) => !comment.reply) ?? []
  const repliesOf = (parentId: string) => comments?.filter((comment) => comment.reply?.parentId === parentId) ?? []

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {isPending ? (
          <CommentsSkeleton />
        ) : topLevel.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aun no hay comentarios. Se el primero.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {topLevel.map((comment) => {
              const replies = repliesOf(comment.id)
              const open = openThreads.has(comment.id)
              return (
                <li key={comment.id}>
                  <CommentItem
                    comment={comment}
                    onLike={() => toggleLike(comment)}
                    onReply={() =>
                      reply({ parentId: comment.id, toUserId: comment.authorId, toUsername: comment.author.username })
                    }
                  />
                  {replies.length > 0 && (
                    <div className="mt-2 pl-11">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setThreadOpen(comment.id, !open)}
                        className="touch-target relative flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <span aria-hidden className="h-px w-6 bg-border" />
                        {open
                          ? 'Ocultar respuestas'
                          : `Ver ${replies.length} ${replies.length === 1 ? 'respuesta' : 'respuestas'}`}
                      </button>
                      {/* Las respuestas se despliegan con una linea a la izquierda que las une al comentario */}
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <ul className="mt-3 flex flex-col gap-3 border-l-2 pl-3">
                              {replies.map((answer) => (
                                <li key={answer.id}>
                                  {/* Responder a una respuesta la deja en el mismo hilo, mencionando a su autor */}
                                  <CommentItem
                                    comment={answer}
                                    small
                                    onLike={() => toggleLike(answer)}
                                    onReply={() =>
                                      reply({ parentId: comment.id, toUserId: answer.authorId, toUsername: answer.author.username })
                                    }
                                  />
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
  onLike: () => void
  onReply: () => void
  // Las respuestas usan un avatar mas chico para que se note que van dentro de un hilo
  small?: boolean
}

function CommentItem({ comment, onLike, onReply, small = false }: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <ProfileHoverCard username={comment.author.username}>
        <span className="shrink-0">
          <UserAvatar user={comment.author} className={small ? 'size-6 text-[10px]' : undefined} />
        </span>
      </ProfileHoverCard>
      <div className="min-w-0 flex-1 text-sm">
        <p>
          <ProfileHoverCard username={comment.author.username}>
            <span className="font-medium">{comment.author.username}</span>
          </ProfileHoverCard>{' '}
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
      <button
        type="button"
        onClick={onLike}
        aria-pressed={comment.likedByMe}
        aria-label={comment.likedByMe ? 'Quitar me gusta al comentario' : 'Me gusta el comentario'}
        className="touch-target relative flex shrink-0 flex-col items-center self-start pt-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {/* Mismo saltito que el like de las publicaciones; el numero rueda al cambiar */}
        <motion.span
          key={String(comment.likedByMe)}
          initial={comment.likedByMe ? { scale: 0.6 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.5 }}
          className="flex"
        >
          <Heart className={cn('size-3.5', comment.likedByMe && 'fill-red-500 text-red-500')} />
        </motion.span>
        {comment.likes > 0 && <RollingNumber value={comment.likes} />}
      </button>
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
    addComment({ postId, text, reply: replyingTo ?? undefined, image })
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

// Renglones grises con la forma de los comentarios mientras llegan
function CommentsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      {['w-2/3', 'w-1/2', 'w-3/5'].map((width) => (
        <div key={width} className="flex gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
            <div className={`h-3 animate-pulse rounded bg-muted ${width}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
