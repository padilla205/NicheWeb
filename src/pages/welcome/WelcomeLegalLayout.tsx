import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { WelcomeFooter } from './WelcomeFooter'
import { WelcomeHeader } from './WelcomeHeader'

// Aviso de privacidad y terminos vistos desde la bienvenida: con la barra y el pie de la bienvenida,
// sin la barra de secciones de la app (que es para quien ya tiene cuenta)
export function WelcomeLegalLayout() {
  const { pathname } = useLocation()
  // Se llega desde el pie de pagina, hasta abajo: el texto empieza desde arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <WelcomeHeader />
      <main className="px-6 pt-28 pb-16 md:px-8">
        <Outlet />
      </main>
      <WelcomeFooter />
    </div>
  )
}
