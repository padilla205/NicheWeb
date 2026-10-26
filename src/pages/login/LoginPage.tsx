import { Navigate, useLocation } from 'react-router'
import { useSession } from '@/hooks/useAuth'
import { AuthForm } from './AuthForm'
import { ClosetOrbit } from './ClosetOrbit'
import { LoginShowcase } from './LoginShowcase'

// Pantalla dividida: en escritorio la tarjeta a la izquierda y el formulario a la derecha;
// en celular la tarjeta queda arriba como encabezado
export function LoginPage() {
  const session = useSession()
  const location = useLocation()

  // Con sesion iniciada (al cargar o justo al entrar) regresa a donde ibas, o al closet
  if (session) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/closet'} replace />
  }

  return (
    // isolate: el fondo de prendas girando queda detras de todo, pero dentro de esta pantalla
    <div className="relative isolate grid min-h-dvh content-start gap-6 bg-background p-4 text-foreground md:content-normal md:grid-cols-2 md:p-6">
      <ClosetOrbit />
      <LoginShowcase />
      <main className="flex items-start justify-center md:items-center">
        <AuthForm />
      </main>
    </div>
  )
}
