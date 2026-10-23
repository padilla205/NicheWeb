import { ArrowUp, ImagePlus, X } from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddComment, useComments } from '@/hooks/usePosts'
import { formatTimeAgo, type Post, type PostComment } from '@/lib/feed'
import { UserAvatar } from './UserAvatar'

type Reply = NonNullable<PostComment['reply']>

// Lista de comentarios con sus respuestas y el cuadro para escribir; el que la usa pone el contenedor
// (flex en columna) para que la lista se desplace y el cuadro quede abajo
export function CommentsThread({ post, autoFocus }: { post: Post; autoFocus: boolean }) {
  const { data: comments, isPending } = useComments(post.id)
  const [replyingTo, setReplyingTo] = useState<Reply | null>(null)

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
              return (
                <li key={comment.id}>
                  <CommentItem
                    comment={comment}
                    onReply={() =>
                      setReplyingTo({
                        parentId: comment.id,
                        toUserId: comment.authorId,
                        toUsername: comment.author.username,
                      })
                    }
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
                              setReplyingTo({
                                parentId: comment.id,
                                toUserId: reply.authorId,
                                toUsername: reply.author.username,
                              })
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
