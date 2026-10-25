import { EyeOff, UserRound } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSession } from '@/hooks/useAuth'
import { useToggleHiddenAuthor } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { ProfileHoverCard } from './ProfileHoverCard'
import { UserAvatar } from './UserAvatar'

type AuthorMenuProps = {
  post: Post
  // Despues de "No me interesa" (por ejemplo, para mostrar el aviso con Deshacer)
  onHidden?: () => void
  className?: string
  avatarClassName?: string
  children?: ReactNode
}

// Al tocar el autor: ir a su perfil o dejar de ver sus publicaciones (en las tuyas solo el perfil)
export function AuthorMenu({ post, onHidden, className, avatarClassName, children }: AuthorMenuProps) {
  const [open, setOpen] = useState(false)
  const isMine = useSession()?.user.id === post.authorId
  const toggleHidden = useToggleHiddenAuthor()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Con mouse, quedarse encima muestra su perfil; al tocar sale el menu */}
      <ProfileHoverCard username={post.author.username} disabled={open}>
        <PopoverTrigger
          className={cn(
            'flex min-w-0 items-center gap-2 rounded text-left outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
            className,
          )}
        >
          <UserAvatar user={post.author} className={avatarClassName} />
          <span className="truncate font-medium">{post.author.username}</span>
          {children}
        </PopoverTrigger>
      </ProfileHoverCard>
      <PopoverContent align="start" className="z-[60] flex w-56 flex-col gap-1 p-1.5">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to={`/u/${post.author.username}`}>
            <UserRound />
            Ver perfil
          </Link>
        </Button>
        {!isMine && (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              setOpen(false)
              toggleHidden.mutate({ authorId: post.authorId, hidden: true })
              onHidden?.()
            }}
          >
            <EyeOff />
            No me interesa
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
