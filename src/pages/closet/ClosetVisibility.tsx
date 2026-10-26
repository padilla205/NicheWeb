import { Globe, Lock } from 'lucide-react'
import { CircleAction } from '@/components/CircleAction'
import { Button } from '@/components/ui/button'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

// Elige si tu closet se ve en tu perfil (publico) o solo lo ves tu (privado)
// circle: como atajo en circulo, para la cabecera negra del celular
export function ClosetVisibility({ circle = false }: { circle?: boolean }) {
  const { closetPublic } = useProfile()
  const updateProfile = useUpdateProfile()

  const toggle = () => updateProfile.mutate({ closetPublic: !closetPublic })

  if (circle) {
    return (
      <CircleAction
        icon={closetPublic ? Globe : Lock}
        label={closetPublic ? 'Publico' : 'Privado'}
        aria-pressed={closetPublic}
        aria-label={closetPublic ? 'Closet publico' : 'Closet privado'}
        onClick={toggle}
      />
    )
  }

  return (
    <Button
      variant="outline"
      className="rounded-full"
      aria-pressed={closetPublic}
      onClick={toggle}
      title={closetPublic ? 'Tu closet se ve en tu perfil. Toca para hacerlo privado.' : 'Solo tu ves tu closet. Toca para mostrarlo en tu perfil.'}
    >
      {closetPublic ? <Globe /> : <Lock />}
      {closetPublic ? 'Closet publico' : 'Closet privado'}
    </Button>
  )
}
