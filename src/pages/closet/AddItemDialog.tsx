import { X } from 'lucide-react'
import { AnimatePresence, motion, useAnimate, usePresence, useReducedMotion } from 'motion/react'
import { type FormEvent, useEffect, useLayoutEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddItem } from '@/hooks/useItems'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { type ClothingType, type Season, seasons } from '@/lib/clothing'
import { cn } from '@/lib/utils'
import { ClothingTypePicker } from './ClothingTypePicker'
import { ColorPicker } from './ColorPicker'
import { PhotoPicker } from './PhotoPicker'
import { TeamPicker } from './TeamPicker'

type AddItemDialogProps = {
  // Boton que abrio la ventana (crece desde ahi y regresa a el); null si esta cerrada
  origin: HTMLElement | null
  onClose: () => void
}

export function AddItemDialog({ origin, onClose }: AddItemDialogProps) {
  return (
    <AnimatePresence>
      {origin !== null && <AddItemPanel origin={origin} onClose={onClose} />}
    </AnimatePresence>
  )
}

// Mismo rebote que la apertura de las tarjetas (unos 300 ms)
const openSpring = { type: 'spring', visualDuration: 0.3, bounce: 0.15 } as const
const PANEL_RADIUS = 16
const BUTTON_RADIUS = 8

// Cuanto hay que mover y encoger el panel (siempre centrado en la pantalla) para que
// quede exactamente encima del boton
function transformToButton(panel: HTMLElement, button: HTMLElement) {
  const rect = button.getBoundingClientRect()
  const scaleX = rect.width / panel.offsetWidth
  const scaleY = rect.height / panel.offsetHeight
  return {
    x: rect.left + rect.width / 2 - window.innerWidth / 2,
    y: rect.top + rect.height / 2 - window.innerHeight / 2,
    scaleX,
    scaleY,
    // Al encoger, las esquinas tambien se encogen; esto las compensa para que se vean como las del boton
    borderRadius: `${BUTTON_RADIUS / scaleX}px / ${BUTTON_RADIUS / scaleY}px`,
  }
}

function AddItemPanel({ origin, onClose }: { origin: HTMLElement; onClose: () => void }) {
  useModalBehavior(onClose)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [isPresent, safeToRemove] = usePresence()
  const reduceMotion = useReducedMotion()

  // Al abrir: el panel empieza encima del boton y crece hasta el centro
  useLayoutEffect(() => {
    const panel = scope.current
    animate(panel, { opacity: [0, 1] }, { duration: 0.1 })
    if (reduceMotion) return
    const start = transformToButton(panel, origin)
    animate(
      panel,
      {
        x: [start.x, 0],
        y: [start.y, 0],
        scaleX: [start.scaleX, 1],
        scaleY: [start.scaleY, 1],
        borderRadius: [start.borderRadius, `${PANEL_RADIUS}px / ${PANEL_RADIUS}px`],
      },
      openSpring,
    )
  }, [animate, scope, origin, reduceMotion])

  // Al cerrar: hace el camino de regreso y se desvanece justo al llegar al boton
  useEffect(() => {
    if (isPresent) return
    const panel = scope.current
    if (!reduceMotion) animate(panel, transformToButton(panel, origin), openSpring)
    // Se quita en cuanto termina de desvanecerse (sin esperar el final del rebote)
    animate(panel, { opacity: 0 }, { delay: 0.2, duration: 0.1 }).then(safeToRemove)
  }, [isPresent, animate, scope, origin, reduceMotion, safeToRemove])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={scope}
          role="dialog"
          aria-modal
          aria-labelledby="add-item-title"
          aria-describedby="add-item-description"
          style={{ opacity: 0, borderRadius: PANEL_RADIUS }}
          // Mientras se cierra ya no recibe clics, para no bloquear la pagina
          className={cn(
            'relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto border bg-popover p-4 text-sm text-popover-foreground',
            isPresent ? 'pointer-events-auto' : 'pointer-events-none',
          )}
        >
          {/* El contenido aparece un instante despues de que la ventana se abre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="grid gap-4"
          >
            <div className="flex flex-col gap-2">
              <h2 id="add-item-title" className="text-base leading-none font-medium">
                Agregar prenda
              </h2>
              <p id="add-item-description" className="text-muted-foreground">
                Sube hasta 5 fotos y elige el tipo de prenda.
              </p>
            </div>
            {/* El formulario vive dentro de la ventana: al cerrarla se borra lo que se habia llenado */}
            <AddItemForm onDone={onClose} />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="absolute top-2 right-2"
            >
              <X />
              <span className="sr-only">Cerrar</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  )
}

function AddItemForm({ onDone }: { onDone: () => void }) {
  const [photos, setPhotos] = useState<File[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<ClothingType | ''>('')
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [team, setTeam] = useState('')
  const addItem = useAddItem()

  const canSave = photos.length > 0 && type !== ''
  const isJersey = type === 'jerseys-futbol'

  // Si cambia a otro tipo de prenda, se borra el equipo elegido
  function changeType(newType: ClothingType) {
    setType(newType)
    if (newType !== 'jerseys-futbol') setTeam('')
  }

  function toggleSeason(season: Season) {
    setSelectedSeasons((current) =>
      current.includes(season) ? current.filter((s) => s !== season) : [...current, season],
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (photos.length === 0 || type === '') return
    addItem({
      photos,
      name,
      type,
      seasons: selectedSeasons,
      colors,
      team: isJersey && team ? team : undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PhotoPicker files={photos} onChange={setPhotos} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-type">Tipo de prenda</Label>
        <ClothingTypePicker id="item-type" value={type} onChange={changeType} />
      </div>

      {isJersey && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-team">
            Equipo <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <TeamPicker id="item-team" value={team} onChange={setTeam} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-name">
          Nombre <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Jeans azules"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Temporada</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Temporada">
          {seasons.map((season) => {
            const active = selectedSeasons.includes(season.value)
            return (
              <Button
                key={season.value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={active}
                onClick={() => toggleSeason(season.value)}
                className={cn(
                  'rounded-full',
                  active && 'border-primary bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground',
                )}
              >
                {season.label}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Colores <span className="font-normal text-muted-foreground">(opcional)</span>
        </span>
        <ColorPicker value={colors} onChange={setColors} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSave}>
          Guardar prenda
        </Button>
      </DialogFooter>
    </form>
  )
}
