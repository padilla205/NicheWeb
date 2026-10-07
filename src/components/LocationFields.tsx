import { SearchSelect } from '@/components/SearchSelect'
import { Label } from '@/components/ui/label'
import { countries, getCountry } from '@/lib/locations'

type LocationFieldsProps = {
  // Prefijo para los id de los campos, por si hay dos formularios en la pantalla
  idPrefix: string
  country: string
  city: string
  onChange: (value: { country: string; city: string }) => void
}

const countryGroups = [{ key: 'paises', label: 'Paises', options: countries }]

// Dos listas con buscador: primero el pais y luego una ciudad de ese pais
export function LocationFields({ idPrefix, country, city, onChange }: LocationFieldsProps) {
  const selectedCountry = getCountry(country)
  const cityGroups = selectedCountry
    ? [{ key: selectedCountry.value, label: selectedCountry.label, options: selectedCountry.cities }]
    : []

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-country`}>Pais</Label>
        <SearchSelect<string>
          id={`${idPrefix}-country`}
          value={country}
          // Al cambiar de pais se borra la ciudad, porque ya no pertenece a ese pais
          onChange={(next) => onChange({ country: next, city: next === country ? city : '' })}
          groups={countryGroups}
          placeholder="Elige un pais"
          searchPlaceholder="Buscar pais..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-city`}>Ciudad</Label>
        {selectedCountry ? (
          <SearchSelect<string>
            id={`${idPrefix}-city`}
            value={city}
            onChange={(next) => onChange({ country, city: next })}
            groups={cityGroups}
            placeholder="Elige una ciudad"
            searchPlaceholder="Buscar ciudad..."
          />
        ) : (
          <p className="flex h-8 items-center text-xs text-muted-foreground">Primero elige un pais</p>
        )}
      </div>
    </div>
  )
}
