import { ChoicePill } from '@/components/ChoicePill'
import { type Season, seasons } from '@/lib/clothing'

type SeasonPickerProps = {
  value: Season[]
  onChange: (value: Season[]) => void
}

// Una prenda puede ser de hasta 2 temporadas; con 2 elegidas se bloquean las demas
// y se desmarca una para cambiar
export const MAX_SEASONS = 2

export function SeasonPicker({ value, onChange }: SeasonPickerProps) {
  function toggle(season: Season) {
    onChange(value.includes(season) ? value.filter((s) => s !== season) : [...value, season])
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Temporada">
      {seasons.map((season) => (
        <ChoicePill
          key={season.value}
          active={value.includes(season.value)}
          disabled={!value.includes(season.value) && value.length >= MAX_SEASONS}
          onClick={() => toggle(season.value)}
        >
          {season.label}
        </ChoicePill>
      ))}
    </div>
  )
}
