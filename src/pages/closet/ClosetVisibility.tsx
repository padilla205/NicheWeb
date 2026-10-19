import { Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

// Elige si tu closet se ve en tu perfil (publico) o solo lo ves tu (privado)
export function ClosetVisibility() {
  const { closetPublic } = useProfile()
  const updateProfile = useUpdateProfile()

  return (
    <Button
      variant="outline"
      className="rounded-full"
      aria-pressed={closetPublic}
      onClick={() => updateProfile({ closetPublic: !closetPublic })}
      title={closetPublic ? 'Tu closet se ve en tu perfil. Toca para hacerlo privado.' : 'Solo tu ves tu closet. Toca para mostrarlo en tu perfil.'}
    >
      {closetPublic ? <Globe /> : <Lock />}
      {closetPublic ? 'Publico' : 'Privado'}
    </Button>
  )
}
