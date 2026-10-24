import { Lock, LockOpen, Plus, Save, Shuffle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ChoicePill } from '@/components/ChoicePill'
import { OutfitBoard } from '@/components/OutfitBoard'
import { Button } from '@/components/ui/button'
import { type ClosetItem, type Season, seasons } from '@/lib/clothing'
import {
  comboKey,
  generateOutfit,
  missingSlots,
  type OptionalSlot,
  type OutfitPieces,
  type OutfitSlot,
  slotLabels,
  type weatherSuggestion,
} from '@/lib/outfits'
import { cn } from '@/lib/utils'
import { SaveOutfitDialog } from './SaveOutfitDialog'
import { WeatherCard } from './WeatherCard'

const optionalSlots: OptionalSlot[] = ['cabeza', 'chamarra', 'accesorio']

type OutfitGeneratorProps = {
  items: ClosetItem[]
  // Combinaciones ya guardadas, para no volver a sugerirlas
  savedKeys: string[]
}

// Arma outfits al azar con tus prendas: una por lugar, con candados y filtro de temporada
export function OutfitGenerator({ items, savedKeys }: OutfitGeneratorProps) {
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [optional, setOptional] = useState<OptionalSlot[]>([])
  const [pieces, setPieces] = useState<OutfitPieces>({})
  const [locked, setLocked] = useState<OutfitSlot[]>([])
  const [repeated, setRepeated] = useState(false)
  const [saving, setSaving] = useState(false)
  // Lo que ya salio en esta visita
  const seen = useRef(new Set<string>())

  const generate = useCallback(
    (options: { seasons?: Season[]; optional?: OptionalSlot[]; lock?: OutfitSlot[] } = {}) => {
      const lock = options.lock ?? locked
      const lockedPieces: OutfitPieces = Object.fromEntries(lock.map((slot) => [slot, pieces[slot]]).filter(([, item]) => item))
      const result = generateOutfit({
        items,
        seasons: options.seasons ?? selectedSeasons,
        optional: options.optional ?? optional,
        locked: lockedPieces,
        seen: new Set([...seen.current, ...savedKeys]),
      })
      seen.current.add(comboKey(result.pieces))
      setPieces(result.pieces)
      setRepeated(result.repeated)
    },
    [items, locked, pieces, selectedSeasons, optional, savedKeys],
  )

  // El primer outfit sale solo en cuanto llegan las prendas
  const started = useRef(false)
  useEffect(() => {
    if (started.current || items.length === 0) return
    started.current = true
    generate()
  }, [items, generate])

  function toggleSeason(season: Season) {
    const next = selectedSeasons.includes(season)
      ? selectedSeasons.filter((s) => s !== season)
      : [...selectedSeasons, season]
    setSelectedSeasons(next)
    generate({ seasons: next })
  }

  // Agregar un lugar opcional solo llena ese lugar; quitarlo lo vacia
  function toggleOptional(slot: OptionalSlot) {
    if (optional.includes(slot)) {
      setOptional(optional.filter((s) => s !== slot))
      setLocked(locked.filter((s) => s !== slot))
      setPieces(({ [slot]: _removed, ...rest }) => rest)
      return
    }
    const next = [...optional, slot]
    setOptional(next)
    generate({ optional: next, lock: Object.keys(pieces) as OutfitSlot[] })
  }

  // Outfit para hoy: temporadas segun la temperatura y chamarra si hace frio o llueve
  function suggestForWeather({ seasons: next, jacket }: ReturnType<typeof weatherSuggestion>) {
    const nextOptional: OptionalSlot[] = jacket && !optional.includes('chamarra') ? [...optional, 'chamarra'] : optional
    setSelectedSeasons(next)
    setOptional(nextOptional)
    generate({ seasons: next, optional: nextOptional })
  }

  function toggleLock(slot: OutfitSlot) {
    setLocked(locked.includes(slot) ? locked.filter((s) => s !== slot) : [...locked, slot])
  }

  const main: OutfitSlot[] = pieces.completo ? ['completo'] : ['arriba', 'abajo']
  const slots: OutfitSlot[] = [...main, 'zapatos', ...optional]
  const missing = missingSlots(items, optional)
  const chosen = Object.values(pieces)

  return (
    <section aria-label="Generador de outfits" className="flex flex-col gap-4">
      <WeatherCard onSuggest={suggestForWeather} />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {seasons.map(({ value, label }) => (
          <ChoicePill key={value} active={selectedSeasons.includes(value)} onClick={() => toggleSeason(value)}>
            {label}
          </ChoicePill>
        ))}
        <span aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-border" />
        {optionalSlots.map((slot) => (
          <ChoicePill key={slot} active={optional.includes(slot)} onClick={() => toggleOptional(slot)}>
            {!optional.includes(slot) && <Plus />}
            {slotLabels[slot]}
          </ChoicePill>
        ))}
      </div>

      <div className="mx-auto w-full max-w-md rounded-3xl border bg-card">
        <OutfitBoard
          pieces={pieces}
          slots={slots}
          renderControl={(slot) =>
            pieces[slot] && (
              <button
                type="button"
                onClick={() => toggleLock(slot)}
                aria-pressed={locked.includes(slot)}
                aria-label={locked.includes(slot) ? `Desbloquear ${slotLabels[slot]}` : `Bloquear ${slotLabels[slot]}`}
                className={cn(
                  'touch-target absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full shadow-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  locked.includes(slot) ? 'bg-primary text-primary-foreground' : 'bg-background/85 text-foreground',
                )}
              >
                {locked.includes(slot) ? <Lock className="size-3.5" /> : <LockOpen className="size-3.5" />}
              </button>
            )
          }
          renderEmpty={(slot) => (
            <Link to="/closet" className="p-2 text-center text-[11px] text-muted-foreground hover:underline">
              {missing.includes(slot) ? `Agrega ${slotLabels[slot].toLowerCase()} a tu closet` : 'Sin prendas de esta temporada'}
            </Link>
          )}
        />
      </div>

      {repeated && (
        <p className="text-center text-sm text-muted-foreground">
          Ya salieron todas las combinaciones posibles; esta se repite. Agrega mas prendas o quita candados.
        </p>
      )}

      <div className="flex justify-center gap-2">
        <Button onClick={() => generate()} disabled={items.length === 0}>
          <Shuffle />
          Generar outfit
        </Button>
        <Button variant="outline" onClick={() => setSaving(true)} disabled={chosen.length < 2}>
          <Save />
          Guardar
        </Button>
      </div>

      <SaveOutfitDialog
        open={saving}
        itemIds={chosen.map((item) => item!.id)}
        onClose={() => setSaving(false)}
      />
    </section>
  )
}
