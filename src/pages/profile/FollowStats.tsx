import { MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useOpenDirectChat } from '@/hooks/useChat'
import { type FollowKind, useFollowCounts, useFollowList, useIsFollowing, useToggleFollow } from '@/hooks/useFollows'
import { UserAvatar } from '@/pages/feed/UserAvatar'

// "12 seguidores · 30 seguidos"; al tocar cada numero se abre la lista de personas
export function FollowStats({ userId }: { userId: string }) {
  const { followers, following } = useFollowCounts(userId)
  const [open, setOpen] = useState<FollowKind | null>(null)

  return (
    <>
      <div className="flex items-center gap-4 text-sm">
        <button type="button" onClick={() => setOpen('followers')} className="rounded hover:underline">
          <span className="font-semibold tabular-nums">{followers}</span>{' '}
          <span className="text-muted-foreground">{followers === 1 ? 'seguidor' : 'seguidores'}</span>
        </button>
        <button type="button" onClick={() => setOpen('following')} className="rounded hover:underline">
          <span className="font-semibold tabular-nums">{following}</span>{' '}
          <span className="text-muted-foreground">{following === 1 ? 'seguido' : 'seguidos'}</span>
        </button>
      </div>
      <FollowListDialog userId={userId} kind={open} onClose={() => setOpen(null)} />
    </>
  )
}

function FollowListDialog({ userId, kind, onClose }: { userId: string; kind: FollowKind | null; onClose: () => void }) {
  const { data: people, isPending } = useFollowList(userId, kind ?? 'followers', kind !== null)

  return (
    <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="max-h-[70dvh] gap-3 overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{kind === 'following' ? 'Seguidos' : 'Seguidores'}</DialogTitle>
        </DialogHeader>
        {isPending ? (
          <div aria-hidden className="flex flex-col gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="size-9 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : people?.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {kind === 'following' ? 'Aun no sigue a nadie.' : 'Aun no tiene seguidores.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {people?.map((person) => (
              <li key={person.username}>
                <Link
                  to={`/u/${person.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-accent"
                >
                  <UserAvatar user={person} className="size-9" />
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium">{person.name}</p>
                    <p className="truncate text-muted-foreground">@{person.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Seguir o dejar de seguir a otra persona; cambia al instante
export function FollowButton({ userId }: { userId: string }) {
  const following = useIsFollowing(userId)
  const toggleFollow = useToggleFollow(userId)

  return (
    <Button variant={following ? 'outline' : 'default'} onClick={() => toggleFollow(!following)}>
      {following ? <UserCheck /> : <UserPlus />}
      {following ? 'Siguiendo' : 'Seguir'}
    </Button>
  )
}

// Escribirle a la persona: abre su chat directo (o lo crea la primera vez)
export function MessageButton({ userId }: { userId: string }) {
  const openChat = useOpenDirectChat()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="outline"
        disabled={openChat.isPending}
        onClick={() => openChat.mutate(userId, { onSuccess: (chatId) => navigate(`/chat/${chatId}`) })}
      >
        <MessageCircle />
        {openChat.isPending ? 'Abriendo' : 'Mensaje'}
      </Button>
      {openChat.isError && <p className="text-xs text-destructive">No se pudo abrir el chat.</p>}
    </div>
  )
}
