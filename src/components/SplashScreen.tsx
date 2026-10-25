import { Shirt } from 'lucide-react'

// Pantalla de carga mientras se lee tu sesion y tu perfil. Es la misma que trae index.html
// (estilos en index.html), asi que al pasar de una a otra no se nota el cambio
export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Cargando Niche">
      <Shirt className="splash-icon" strokeWidth={1.5} aria-hidden />
      <p className="splash-word">Niche</p>
    </div>
  )
}
