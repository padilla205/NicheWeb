import { Flag, Pencil, Plus, Settings } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { MorphButton } from '@/components/MorphButton'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import { useIsAdmin } from '@/hooks/useReports'
import { PublishPostDialog } from '@/pages/feed/PublishPostDialog'
import { EditProfileDialog } from './EditProfileDialog'
import { FollowStats } from './FollowStats'
import { ProfileSummary } from './ProfileSummary'

// Portada, foto, nombre, descripcion y redes del usuario
export function ProfileHeader() {
  const profile = useProfile()
  const isAdmin = useIsAdmin()
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

        {/* En celular, si no caben, los botones pasan a otra fila en vez de salirse de la pantalla */}
        <div className="flex flex-wrap justify-center gap-2">
          <MorphButton hidden={publishOrigin !== null} onOpen={setPublishOrigin}>
            <Plus />
            Publicar
          </MorphButton>
          <MorphButton variant="outline" hidden={editOrigin !== null} onOpen={setEditOrigin}>
            <Pencil />
            Editar perfil
          </MorphButton>
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link to="/reportes">
                <Flag />
                Reportes
              </Link>
            </Button>
          )}
          <Button variant="outline" size="icon" asChild>
            <Link to="/mas-opciones" aria-label="Mas opciones" title="Mas opciones">
              <Settings />
            </Link>
          </Button>
        </div>
      </header>
      {/* Fuera del encabezado para que no hereden el texto centrado */}
      <PublishPostDialog origin={publishOrigin} onClose={closePublish} />
      <EditProfileDialog origin={editOrigin} onClose={closeEdit} />
    </>
  )
}
