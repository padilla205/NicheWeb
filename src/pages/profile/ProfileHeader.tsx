import { LogOut, Pencil, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { MorphButton } from '@/components/MorphButton'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { PublishPostDialog } from '@/pages/feed/PublishPostDialog'
import { EditProfileDialog } from './EditProfileDialog'
import { SocialLinks } from './SocialLinks'

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
        {/* Sin foto de portada se ve un degradado suave */}
        <div className="h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/30 md:h-56">
          {profile.coverUrl && <img src={profile.coverUrl} alt="" className="size-full object-cover" />}
        </div>

        {/* La foto se monta sobre el borde de la portada */}
        <div className="-mt-16 flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted text-3xl font-semibold uppercase md:-mt-20 md:size-36">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`Foto de ${profile.name}`} className="size-full object-cover" />
          ) : (
            <span aria-hidden>{profile.name.charAt(0)}</span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>

        {profile.bio && <p className="max-w-md text-sm whitespace-pre-line">{profile.bio}</p>}

        <SocialLinks links={profile.socials} />

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
