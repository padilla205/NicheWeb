import { ChoicePill } from '@/components/ChoicePill'
import { type Season, seasons } from '@/lib/clothing'

type SeasonPickerProps = {
  value: Season[]
  onChange: (value: Season[]) => void
}

// Se pueden elegir varias temporadas a la vez
export function SeasonPicker({ value, onChange }: SeasonPickerProps) {
  function toggle(season: Season) {
    onChange(value.includes(season) ? value.filter((s) => s !== season) : [...value, season])
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Temporada">
      {seasons.map((season) => (
        <ChoicePill key={season.value} active={value.includes(season.value)} onClick={() => toggle(season.value)}>
          {season.label}
        </ChoicePill>
      ))}
    </div>
  )
}
