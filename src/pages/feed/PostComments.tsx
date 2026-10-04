import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAddComment } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'

type PostCommentsProps = {
  post: Post
  open: boolean
  onOpen: () => void
}

export function PostComments({ post, open, onOpen }: PostCommentsProps) {
  const count = post.comments.length

  return (
    <div className="flex flex-col gap-2">
      {!open && count > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="self-start text-sm text-muted-foreground hover:text-foreground"
        >
          {count === 1 ? 'Ver el comentario' : `Ver los ${count} comentarios`}
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-1">
              {count === 0 && (
                <p className="text-sm text-muted-foreground">Aun no hay comentarios. Se el primero.</p>
              )}
              <ul className="flex flex-col gap-1.5">
                {post.comments.map((comment) => (
                  <li key={comment.id} className="text-sm">
                    <span className="font-medium">{comment.author.username}</span> {comment.text}
                  </li>
                ))}
              </ul>
              <CommentForm postId={post.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CommentForm({ postId }: { postId: string }) {
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
        autoFocus
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Enviar comentario">
        <ArrowUp />
      </Button>
    </form>
  )
}
