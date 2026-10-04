import type { FeedUser } from '@/lib/feed'
import { cn } from '@/lib/utils'

// Circulo con la inicial del usuario; se cambia por su foto de perfil cuando haya perfiles reales
export function UserAvatar({ user, className }: { user: FeedUser; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase',
        className,
      )}
    >
      {user.name.charAt(0)}
    </span>
  )
}
