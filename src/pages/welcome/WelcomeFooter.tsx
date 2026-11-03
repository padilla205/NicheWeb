import { Link } from 'react-router'
import { BrandMark } from '@/components/BrandMark'

// Pie de la bienvenida: marca y links legales (el correo de contacto se agrega despues)
export function WelcomeFooter() {
  const linkClass = 'text-muted-foreground transition-colors duration-150 hover:text-foreground'
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between md:px-8">
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <BrandMark />
            Niche
          </Link>
          <p className="max-w-xs text-sm text-pretty text-muted-foreground">Tu closet digital: guarda tus prendas, arma outfits, comparte y vende.</p>
        </div>
        <div className="text-sm">
          <nav aria-label="Legal" className="flex flex-col gap-3">
            <p className="font-medium">Legal</p>
            <Link to="/bienvenida/privacidad" className={linkClass}>
              Aviso de privacidad
            </Link>
            <Link to="/bienvenida/terminos" className={linkClass}>
              Terminos de uso
            </Link>
          </nav>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-10 text-xs text-muted-foreground md:px-8">© {new Date().getFullYear()} Niche.</p>
    </footer>
  )
}
