import type { Profile } from '@/lib/profile'
import { SocialLinks } from './SocialLinks'

// Portada, foto, nombre, descripcion y redes; igual en tu perfil y en el de los demas
export function ProfileSummary({ profile }: { profile: Profile }) {
  return (
    <>
      {/* Sin foto de portada se ve un degradado suave */}
      <div className="h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/30 md:h-56">
        {profile.coverUrl && <img src={profile.coverUrl} alt="" className="size-full object-cover" />}
      </div>

      {/* La foto se monta sobre el borde de la portada */}
      <div className="-mt-16 flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted text-3xl font-semibold uppercase md:-mt-20 md:size-36">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`Foto de ${profile.name}`} className="size-full object-cover text-transparent" />
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
    </>
  )
}
