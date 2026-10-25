import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePostLikers } from '@/hooks/usePosts'
import type { Post } from '@/lib/feed'
import { UserAvatar } from './UserAvatar'

// "Le gusta a juan y 3 mas" con las fotos encimadas; al tocarlo se abre la lista completa
export function LikedBy({ post }: { post: Post }) {
  const { data: likers } = usePostLikers(post.id)
  const [open, setOpen] = useState(false)

  if (post.likes === 0 || !likers?.length) return null
  const others = post.likes - 1

  return (
    <>
      {/* Linea arriba y aire alrededor para separarlo de los botones de like y comentar */}
      <div className="-mx-2.5 mt-2.5 border-t px-2.5 pt-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:underline"
        >
          <span aria-hidden className="flex -space-x-1.5">
            {likers.slice(0, 3).map((user, index) => (
              <motion.span
                key={user.username}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.04, duration: 0.15 }}
                className="rounded-full ring-2 ring-popover"
              >
                <UserAvatar user={user} className="size-5 text-[9px]" />
              </motion.span>
            ))}
          </span>
          <span className="min-w-0 truncate">
            Le gusta a <span className="font-medium">{likers[0].username}</span>
            {others > 0 && (
              <>
                {' '}y <span className="font-medium tabular-nums">{others}</span> {others === 1 ? 'persona mas' : 'personas mas'}
              </>
            )}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="max-h-[70dvh] gap-3 overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Me gusta</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-1">
            {likers.map((user) => (
              <li key={user.username}>
                <Link
                  to={`/u/${user.username}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-accent"
                >
                  <UserAvatar user={user} className="size-9" />
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
