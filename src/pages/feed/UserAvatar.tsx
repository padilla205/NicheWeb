import type { FeedUser } from '@/lib/feed'
import { cn } from '@/lib/utils'

// Foto de perfil del usuario en un circulo; sin foto, su inicial
export function UserAvatar({ user, className }: { user: FeedUser; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold uppercase',
        className,
      )}
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        user.name.charAt(0)
      )}
    </span>
  )
}
