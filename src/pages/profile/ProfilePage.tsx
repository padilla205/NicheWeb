import { MotionConfig } from 'motion/react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'
import { Reveal } from '@/components/Reveal'

export function ProfilePage() {
  return (
    // Mismo resorte que el closet (las prendas del perfil abren igual); se respeta si el sistema pide menos movimiento
    <MotionConfig transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }} reducedMotion="user">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <ProfileHeader />
        {/* Las pestanas aparecen subiendo, como el resto de las secciones al bajar */}
        <Reveal>
          <ProfileTabs />
        </Reveal>
      </div>
    </MotionConfig>
  )
}
