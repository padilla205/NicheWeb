import { BrandMark } from '@/components/BrandMark'

// Pantalla de carga mientras se lee tu sesion y tu perfil. Es la misma que trae index.html
// (estilos en index.html), asi que al pasar de una a otra no se nota el cambio
export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Cargando Niche">
      <BrandMark className="splash-icon" />
      <p className="splash-word">Niche</p>
    </div>
  )
}
