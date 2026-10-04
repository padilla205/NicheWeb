import { Check, Heart, MessageCircle, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/feed'
import { cn } from '@/lib/utils'

type PostActionsProps = {
  post: Post
  onLike: () => void
  onComment: () => void
}

export function PostActions({ post, onLike, onComment }: PostActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={post.likedByMe}
        aria-label={post.likedByMe ? 'Quitar me gusta' : 'Me gusta'}
        onClick={onLike}
        className="gap-1.5"
      >
        {/* Al dar like el corazon da un pequeno salto; key hace que la animacion se repita cada vez */}
        <motion.span
          key={String(post.likedByMe)}
          initial={post.likedByMe ? { scale: 0.6 } : false}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.5 }}
          className="flex"
        >
          <Heart className={cn('size-5', post.likedByMe && 'fill-red-500 text-red-500')} />
        </motion.span>
        <span className="tabular-nums">{post.likes}</span>
      </Button>
      <Button variant="ghost" size="sm" aria-label="Comentar" onClick={onComment} className="gap-1.5">
        <MessageCircle className="size-5" />
        <span className="tabular-nums">{post.comments.length}</span>
      </Button>
      <ShareButton post={post} />
    </div>
  )
}

function ShareButton({ post }: { post: Post }) {
  const [copied, setCopied] = useState(false)

  // El aviso de "Link copiado" se quita solo despues de 2 segundos
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  async function share() {
    const url = `${window.location.origin}/feed?post=${post.id}`
    // En el celular se abre el menu de compartir del sistema; en la computadora se copia el link
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: post.caption, url })
      } catch {
        // El usuario cerro el menu sin compartir; no hay nada que hacer
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Algunos navegadores bloquean el portapapeles (por ejemplo, fuera de https); no se muestra el aviso
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={share} className="gap-1.5">
      {copied ? <Check className="size-5" /> : <Send className="size-5" />}
      {copied ? 'Link copiado' : <span className="sr-only">Compartir</span>}
    </Button>
  )
}
