import { Link } from 'react-router'
import { BrandMark } from '@/components/BrandMark'
import { Button } from '@/components/ui/button'

// Barra de arriba de las paginas publicas (bienvenida y sus textos legales): logo y "Entrar"
export function WelcomeHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-background/80 px-5 py-3 backdrop-blur-md md:px-8 md:py-4">
      <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <BrandMark />
        Niche
      </Link>
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/login">Entrar</Link>
      </Button>
    </header>
  )
}
