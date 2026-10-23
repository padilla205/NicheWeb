import { LogOut, Pencil, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { MorphButton } from '@/components/MorphButton'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { PublishPostDialog } from '@/pages/feed/PublishPostDialog'
import { EditProfileDialog } from './EditProfileDialog'
import { FollowStats } from './FollowStats'
import { ProfileSummary } from './ProfileSummary'

// Portada, foto, nombre, descripcion y redes del usuario
export function ProfileHeader() {
  const profile = useProfile()
  const signOut = useSignOut()
  // Boton que abrio "Editar perfil"; null si la ventana esta cerrada
  const [editOrigin, setEditOrigin] = useState<HTMLElement | null>(null)
  const closeEdit = useCallback(() => setEditOrigin(null), [])
  const [publishOrigin, setPublishOrigin] = useState<HTMLElement | null>(null)
  const closePublish = useCallback(() => setPublishOrigin(null), [])

  return (
    <>
      <header className="flex flex-col items-center gap-3 text-center">
        <ProfileSummary profile={profile} />
        <FollowStats userId={profile.id} />

        <div className="flex gap-2">
          <MorphButton hidden={publishOrigin !== null} onOpen={setPublishOrigin}>
            <Plus />
            Publicar
          </MorphButton>
          <MorphButton variant="outline" hidden={editOrigin !== null} onOpen={setEditOrigin}>
            <Pencil />
            Editar perfil
          </MorphButton>
          {/* Al cerrar sesion, RequireAuth te manda a /login */}
          <Button variant="ghost" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
            <LogOut />
            Cerrar sesion
          </Button>
        </div>
      </header>
      {/* Fuera del encabezado para que no hereden el texto centrado */}
      <PublishPostDialog origin={publishOrigin} onClose={closePublish} />
      <EditProfileDialog origin={editOrigin} onClose={closeEdit} />
    </>
  )
}
