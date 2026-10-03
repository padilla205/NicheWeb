import { SearchSelect } from '@/components/SearchSelect'
import { type ClothingType, clothingZones } from '@/lib/clothing'

type ClothingTypePickerProps = {
  id?: string
  value: ClothingType | ''
  onChange: (value: ClothingType) => void
}

const typeGroups = clothingZones.map((zone) => ({
  key: zone.zone,
  label: zone.label,
  options: zone.types,
}))

export function ClothingTypePicker({ id, value, onChange }: ClothingTypePickerProps) {
  return (
    <SearchSelect
      id={id}
      value={value}
      onChange={onChange}
      groups={typeGroups}
      placeholder="Elige un tipo"
      searchPlaceholder="Buscar prenda..."
    />
  )
}
