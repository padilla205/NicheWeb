import { Plus, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { ImageInput } from '@/components/ImageInput'
import { MorphDialog } from '@/components/MorphDialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { BIO_MAX, getPlatform, getSocialUrl, type SocialLink, socialPlatforms } from '@/lib/profile'

type EditProfileDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
}

export function EditProfileDialog({ origin, onClose }: EditProfileDialogProps) {
  return (
    <MorphDialog
      origin={origin}
      onClose={onClose}
      title="Editar perfil"
      description="Cambia tu portada, tu foto, tu descripcion y tus redes."
    >
      <EditProfileForm onDone={onClose} />
    </MorphDialog>
  )
}

function EditProfileForm({ onDone }: { onDone: () => void }) {
  const profile = useProfile()
  const updateProfile = useUpdateProfile()
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [bio, setBio] = useState(profile.bio)
  const [socials, setSocials] = useState<SocialLink[]>(profile.socials)

  // Las redes que aun no agregas, para ofrecerlas como opciones
  const available = socialPlatforms.filter(
    (option) => !socials.some((link) => link.platform === option.value),
  )
  // Una red escrita pero con un usuario o link invalido no deja guardar
  const hasInvalid = socials.some((link) => link.handle.trim() !== '' && getSocialUrl(link) === null)

  function changeHandle(index: number, handle: string) {
    setSocials(socials.map((link, i) => (i === index ? { ...link, handle } : link)))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (hasInvalid) return
    updateProfile({
      coverUrl,
      avatarUrl,
      bio: bio.trim(),
      // Las redes que quedaron vacias no se guardan
      socials: socials.filter((link) => link.handle.trim() !== ''),
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Portada</span>
        <ImageInput onPick={setCoverUrl} className="h-28 w-full rounded-lg">
          {coverUrl && <img src={coverUrl} alt="" className="size-full object-cover" />}
        </ImageInput>
      </div>

      <div className="flex items-center gap-3">
        <ImageInput onPick={setAvatarUrl} className="size-20 shrink-0 rounded-full">
          {avatarUrl && <img src={avatarUrl} alt="" className="size-full object-cover" />}
        </ImageInput>
        <div className="text-sm">
          <p className="font-medium">Foto de perfil</p>
          <p className="text-muted-foreground">Haz clic en el circulo para cambiarla.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="profile-bio">Descripcion</Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {bio.length}/{BIO_MAX}
          </span>
        </div>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Cuenta algo sobre tu estilo"
          maxLength={BIO_MAX}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Redes sociales</span>
        {socials.map((link, index) => {
          const { icon: Icon, label } = getPlatform(link.platform)
          const isWeb = link.platform === 'web'
          const invalid = link.handle.trim() !== '' && getSocialUrl(link) === null
          return (
            <div key={link.platform} className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <Input
                aria-label={label}
                aria-invalid={invalid}
                value={link.handle}
                onChange={(event) => changeHandle(index, event.target.value)}
                placeholder={isWeb ? 'misitio.com' : `Tu usuario de ${label}`}
                maxLength={isWeb ? 200 : 40}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setSocials(socials.filter((_, i) => i !== index))}
              >
                <X />
                <span className="sr-only">Quitar {label}</span>
              </Button>
            </div>
          )
        })}
        {hasInvalid && (
          <p className="text-xs text-destructive">
            Revisa lo marcado en rojo: un usuario solo lleva letras, numeros, puntos o guiones, y un sitio web debe ser un link valido.
          </p>
        )}
        {available.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Agregar red">
            {available.map((option) => (
              <ChoicePill
                key={option.value}
                active={false}
                onClick={() => setSocials([...socials, { platform: option.value, handle: '' }])}
              >
                <Plus />
                {option.label}
              </ChoicePill>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={hasInvalid}>
          Guardar
        </Button>
      </DialogFooter>
    </form>
  )
}
