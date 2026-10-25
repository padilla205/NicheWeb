import { type ReactNode, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { useSession } from '@/hooks/useAuth'
import { useFollowCounts } from '@/hooks/useFollows'
import { useUserProfile } from '@/hooks/useProfile'
import { FollowButton } from '@/pages/profile/FollowStats'
import { UserAvatar } from './UserAvatar'

// En escritorio, al dejar el mouse sobre un nombre o foto sale una tarjetita con su perfil.
// Con el dedo no se abre (Radix solo la abre con mouse), asi que en celular todo queda igual
type ProfileHoverCardProps = {
  username: string
  children: ReactNode
  // Por ejemplo, mientras el menu del autor esta abierto, para no encimar dos ventanitas
  disabled?: boolean
}

export function ProfileHoverCard({ username, children, disabled = false }: ProfileHoverCardProps) {
  const [open, setOpen] = useState(false)
  return (
    <HoverCard open={open && !disabled} onOpenChange={setOpen} openDelay={400} closeDelay={150}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="z-[60] w-72 p-4">
        <ProfilePreview username={username} />
      </HoverCardContent>
    </HoverCard>
  )
}

// Solo existe mientras la tarjeta esta abierta: el perfil se pide al abrirla, no por cada nombre
function ProfilePreview({ username }: { username: string }) {
  const { data: profile, isPending } = useUserProfile(username)

  if (isPending) {
    return (
      <div aria-hidden className="flex items-center gap-3">
        <div className="size-12 animate-pulse rounded-full bg-muted" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }
  if (!profile) return <p className="text-sm text-muted-foreground">Este perfil ya no existe.</p>

  return (
    <div className="flex flex-col gap-3">
      <Link to={`/u/${profile.username}`} className="flex items-center gap-3 rounded-lg hover:underline">
        <UserAvatar user={profile} className="size-12" />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{profile.name}</span>
          <span className="block truncate text-muted-foreground">@{profile.username}</span>
        </span>
      </Link>
      {profile.bio && <p className="line-clamp-3 text-sm">{profile.bio}</p>}
      <Stats userId={profile.id} />
      <Actions userId={profile.id} username={profile.username} />
    </div>
  )
}

function Stats({ userId }: { userId: string }) {
  const { followers, following } = useFollowCounts(userId)
  return (
    <p className="flex gap-4 text-sm">
      <span>
        <span className="font-semibold tabular-nums">{followers}</span>{' '}
        <span className="text-muted-foreground">{followers === 1 ? 'seguidor' : 'seguidores'}</span>
      </span>
      <span>
        <span className="font-semibold tabular-nums">{following}</span>{' '}
        <span className="text-muted-foreground">{following === 1 ? 'seguido' : 'seguidos'}</span>
      </span>
    </p>
  )
}

function Actions({ userId, username }: { userId: string; username: string }) {
  const isMe = useSession()?.user.id === userId
  return (
    <div className="flex gap-2 [&>*]:flex-1">
      {!isMe && <FollowButton userId={userId} />}
      <Button variant="outline" asChild>
        <Link to={`/u/${username}`}>Ver perfil</Link>
      </Button>
    </div>
  )
}
