import { Heart, Plus } from 'lucide-react'
import { CircleAction } from '@/components/CircleAction'
import { useUserLocation } from '@/hooks/useUserLocation'
import { getCityLabel } from '@/lib/locations'
import type { ListingFilters } from '@/lib/marketplace'
import { mobileHeroClass } from '@/lib/styles'
import { LocationButton } from './LocationButton'
import { MarketplaceFilters } from './MarketplaceFilters'

type MarketplaceHeroProps = {
  filters: ListingFilters
  onFiltersChange: (filters: ListingFilters) => void
  sizes: string[]
  brands: string[]
  showSaved: boolean
  onToggleSaved: () => void
  onCreate: (button: HTMLElement) => void
  // La ventana de crear venta esta abierta (salio del circulo de Vender)
  createOpen: boolean
}

// Cabecera negra del marketplace en celular: titulo, tu ciudad y una fila de atajos en circulos.
// Debajo, las ventas van en una hoja que sube encima de ella (ver MarketplacePage)
export function MarketplaceHero(props: MarketplaceHeroProps) {
  const location = useUserLocation()

  return (
    <div className={mobileHeroClass}>
      <h1 className="text-[28px] font-semibold tracking-tight">Marketplace</h1>
      <p className="text-sm text-muted-foreground">
        {location ? `Ventas cerca de ${getCityLabel(location)}` : 'Compra y vende ropa en persona'}
      </p>
      <div className="mt-6 flex justify-between">
        <CircleAction icon={Plus} label="Vender" hidden={props.createOpen} iconTurn={90} onClick={(event) => props.onCreate(event.currentTarget)} />
        <MarketplaceFilters value={props.filters} onChange={props.onFiltersChange} sizes={props.sizes} brands={props.brands} circle />
        <LocationButton circle />
        <CircleAction icon={Heart} label="Guardados" active={props.showSaved} aria-pressed={props.showSaved} onClick={props.onToggleSaved} />
      </div>
    </div>
  )
}
