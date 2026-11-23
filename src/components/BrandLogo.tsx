import { cn } from '@/lib/utils'

// Logo completo: las 4 chamarras rojas en fila (estilos en index.html, clase brand-logo). El relleno de
// cada chamarra toma el color del fondo de la pagina para tapar a la de atras.
// El nombre accesible lo aporta el texto "Niche" que lo acompana
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('brand-logo w-10', className)}>
      <span />
      <span />
      <span />
      <span />
    </span>
  )
}
