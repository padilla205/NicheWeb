import { ArrowLeft, Home } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { DemonBearIllustration } from './DemonBearIllustration'

// Cualquier direccion que no existe. Se ve con o sin cuenta
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 py-10 text-center">
      <DemonBearIllustration className="bear-float w-44 md:w-52" />
      <p className="text-6xl font-semibold tracking-tight tabular-nums">404</p>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Esta pagina no existe</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          El link esta mal escrito o la pagina ya se borro. Mejor regresa antes de que el oso se enoje mas.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft />
          Regresar
        </Button>
        {/* "/" lleva a tu closet, o a entrar si no tienes sesion */}
        <Button asChild>
          <Link to="/">
            <Home />
            Ir al inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
