import { SearchSelect } from '@/components/SearchSelect'
import { footballLeagues } from '@/lib/teams'

type TeamPickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
}

const teamGroups = footballLeagues.map((league) => ({
  key: league.league,
  label: league.label,
  options: league.teams,
}))

export function TeamPicker({ id, value, onChange }: TeamPickerProps) {
  return (
    <SearchSelect<string>
      id={id}
      value={value}
      onChange={onChange}
      groups={teamGroups}
      placeholder="Elige un equipo"
      searchPlaceholder="Buscar equipo..."
    />
  )
}
