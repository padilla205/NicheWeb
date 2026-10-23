import { Navigate, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useAuth'
import { useProfileQuery } from '@/hooks/useProfile'

// Sin sesion manda a /login y recuerda a donde ibas para regresarte despues de entrar.
// Con sesion espera a tener el perfil, que usan casi todas las pantallas.
export function RequireAuth() {
  const session = useSession()
  const location = useLocation()
  const profile = useProfileQuery()

  if (session === null) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (profile.isError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-muted-foreground">No se pudo cargar tu perfil. Revisa tu conexion.</p>
        <Button variant="outline" onClick={() => profile.refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }
  // Leer la sesion y el perfil tarda un instante; mientras, no se muestra nada
  if (!profile.data) return null
  return <Outlet />
}
