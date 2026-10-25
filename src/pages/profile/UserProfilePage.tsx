import { ArrowLeft } from 'lucide-react'
import { MotionConfig } from 'motion/react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { useBlockState } from '@/hooks/useChat'
import { useProfile, useUserProfile } from '@/hooks/useProfile'
import { EmptyTab } from './EmptyTab'
import { FollowButton, FollowStats, MessageButton } from './FollowStats'
import { ProfileMoreMenu } from './ProfileMoreMenu'
import { ProfileSummary } from './ProfileSummary'
import { ProfileTabs } from './ProfileTabs'

// Perfil de otra persona (/u/:username): igual que el tuyo, pero sin opciones para editar
export function UserProfilePage() {
  const { username } = useParams()
  const me = useProfile()
  const navigate = useNavigate()
  const { data: profile, isPending } = useUserProfile(username)
  const blockedByMe = useBlockState(profile?.id) === 'blocked-by-me'

  if (username === me.username) return <Navigate to="/profile" replace />

  return (
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <Button variant="ghost" size="sm" className="-mb-4 -ml-2 self-start" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Volver
        </Button>
        {isPending ? (
          <div aria-hidden className="flex flex-col items-center gap-3">
            <div className="h-40 w-full animate-pulse rounded-2xl bg-muted md:h-56" />
            <div className="-mt-16 size-28 animate-pulse rounded-full border-4 border-background bg-muted md:-mt-20 md:size-36" />
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          </div>
        ) : !profile ? (
          <EmptyTab>Este perfil no existe.</EmptyTab>
        ) : (
          <>
            <header className="flex flex-col items-center gap-3 text-center">
              <ProfileSummary profile={profile} />
              <FollowStats userId={profile.id} />
              <div className="flex items-start gap-2">
                <FollowButton userId={profile.id} />
                <MessageButton userId={profile.id} />
                <ProfileMoreMenu userId={profile.id} username={profile.username} />
              </div>
              {blockedByMe && (
                <p className="text-sm text-muted-foreground">
                  Bloqueaste a @{profile.username}: no ves lo que publica ni puede escribirte.
                </p>
              )}
            </header>
            <ProfileTabs user={profile} />
          </>
        )}
      </div>
    </MotionConfig>
  )
}
