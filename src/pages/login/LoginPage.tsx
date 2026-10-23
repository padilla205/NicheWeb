import { AuthForm } from './AuthForm'
import { LoginShowcase } from './LoginShowcase'

// Pantalla dividida: en escritorio la tarjeta a la izquierda y el formulario a la derecha;
// en celular la tarjeta queda arriba como encabezado
export function LoginPage() {
  return (
    <div className="grid min-h-dvh content-start gap-6 bg-background p-4 text-foreground md:content-normal md:grid-cols-2 md:p-6">
      <LoginShowcase />
      <main className="flex items-start justify-center md:items-center">
        <AuthForm />
      </main>
    </div>
  )
}
