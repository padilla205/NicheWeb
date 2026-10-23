import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '@/hooks/useAuth'

// Sin sesion manda a /login y recuerda a donde ibas para regresarte despues de entrar
export function RequireAuth() {
  const session = useSession()
  const location = useLocation()

  // Leer la sesion guardada tarda unos milisegundos; mientras, no se muestra nada
  if (session === undefined) return null
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
