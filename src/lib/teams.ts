// Equipos para los jerseys de futbol. Por ahora solo la Liga MX; despues se pueden agregar mas ligas
export const footballLeagues = [
  {
    league: 'liga-mx',
    label: 'Liga MX',
    teams: [
      { value: 'america', label: 'America' },
      { value: 'atlas', label: 'Atlas' },
      { value: 'atletico-san-luis', label: 'Atletico de San Luis' },
      { value: 'cruz-azul', label: 'Cruz Azul' },
      { value: 'chivas', label: 'Chivas' },
      { value: 'juarez', label: 'FC Juarez' },
      { value: 'leon', label: 'Leon' },
      { value: 'mazatlan', label: 'Mazatlan' },
      { value: 'monterrey', label: 'Monterrey' },
      { value: 'necaxa', label: 'Necaxa' },
      { value: 'pachuca', label: 'Pachuca' },
      { value: 'puebla', label: 'Puebla' },
      { value: 'pumas', label: 'Pumas' },
      { value: 'queretaro', label: 'Queretaro' },
      { value: 'santos', label: 'Santos Laguna' },
      { value: 'tigres', label: 'Tigres' },
      { value: 'tijuana', label: 'Tijuana' },
      { value: 'toluca', label: 'Toluca' },
    ],
  },
] as const

export function getTeamLabel(team: string) {
  for (const league of footballLeagues) {
    const found = league.teams.find((t) => t.value === team)
    if (found) return found.label
  }
  return team
}
