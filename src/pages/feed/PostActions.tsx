import { Check, Heart, MessageCircle, Repeat2, Send } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/feed'
import { popIn } from '@/lib/motion'
import { cn } from '@/lib/utils'

type PostActionsProps = {
  post: Post
  onLike: () => void
  onComment: () => void
  onShareToProfile: () => void
}

export function PostActions({ post, onLike, onComment, onShareToProfile }: PostActionsProps) {
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
      <RepostButton shared={post.sharedByMe} onClick={onShareToProfile} />
      <ShareButton post={post} />
    </div>
  )
}

// Republicar en tu perfil: al activarse el icono cambia de color y vuelve a aparecer con escala y desenfoque
function RepostButton({ shared, onClick }: { shared: boolean; onClick: () => void }) {
  const label = shared ? 'Quitar de mi perfil' : 'Compartir en mi perfil'
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={shared}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn('gap-1.5', shared && 'text-green-600 hover:text-green-600 dark:text-green-500')}
    >
      <span className="relative flex size-5">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={String(shared)} className="flex" {...popIn}>
            <Repeat2 className="size-5" />
          </motion.span>
        </AnimatePresence>
      </span>
    </Button>
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
