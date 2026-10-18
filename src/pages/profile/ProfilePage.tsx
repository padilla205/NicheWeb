import { MotionConfig } from 'motion/react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'

export function ProfilePage() {
  return (
    // Mismo resorte que el closet (las prendas del perfil abren igual); se respeta si el sistema pide menos movimiento
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <ProfileHeader />
        <ProfileTabs />
      </div>
    </MotionConfig>
  )
}
