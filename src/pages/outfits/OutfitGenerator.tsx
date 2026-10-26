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
    // Celular: el outfit primero, luego las opciones, y los botones pegados abajo para tenerlos a la mano.
    // Escritorio: el outfit a la izquierda; opciones y botones a la derecha (mismo orden que en celular)
    <section
      aria-label="Generador de outfits"
      className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-8"
    >
      <div className="mx-auto w-full max-w-md rounded-3xl border bg-card lg:row-span-2">
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

      <div className="flex min-w-0 flex-col gap-4">
        <WeatherCard onSuggest={suggestForWeather} />
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Temporada</h2>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {seasons.map(({ value, label }) => (
              <ChoicePill key={value} active={selectedSeasons.includes(value)} onClick={() => toggleSeason(value)}>
                {label}
              </ChoicePill>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Agregar al outfit</h2>
          <div className="flex flex-wrap gap-2">
            {optionalSlots.map((slot) => (
              <ChoicePill key={slot} active={optional.includes(slot)} onClick={() => toggleOptional(slot)}>
                {!optional.includes(slot) && <Plus />}
                {slotLabels[slot]}
              </ChoicePill>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Toca el candado de una prenda para dejarla fija al generar.</p>
        {repeated && (
          <p className="text-sm text-muted-foreground">
            Ya salieron todas las combinaciones posibles; esta se repite. Agrega mas prendas o quita candados.
          </p>
        )}
      </div>

      {/* En celular y tableta se quedan pegados abajo (arriba de la barra de navegacion del celular) */}
      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] flex justify-center gap-2 md:bottom-4 lg:static lg:col-start-2 lg:justify-start">
        <div className="flex gap-2 rounded-full border bg-background/95 p-1.5 shadow-lg lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button className="rounded-full" onClick={() => generate()} disabled={items.length === 0}>
            <Shuffle />
            Generar outfit
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setSaving(true)} disabled={chosen.length < 2}>
            <Save />
            Guardar
          </Button>
        </div>
      </div>

      <SaveOutfitDialog
        open={saving}
        itemIds={chosen.map((item) => item!.id)}
        onClose={() => setSaving(false)}
      />
    </section>
  )
}
