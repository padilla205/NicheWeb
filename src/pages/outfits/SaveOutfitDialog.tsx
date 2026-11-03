import { type FormEvent, useState } from 'react'
import { type ButtonState, StatefulButton } from '@/components/StatefulButton'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSaveOutfit } from '@/hooks/useOutfits'

type SaveOutfitDialogProps = {
  open: boolean
  itemIds: string[]
  onClose: () => void
}

// Guardar el outfit: nombre opcional y si se muestra en la seccion Closet de tu perfil
export function SaveOutfitDialog({ open, itemIds, onClose }: SaveOutfitDialogProps) {
  const [name, setName] = useState('')
  const [inCloset, setInCloset] = useState(false)
  const saveOutfit = useSaveOutfit()
  // Despues de guardar se ve la palomita un momento antes de cerrar
  const [saved, setSaved] = useState(false)
  const buttonState: ButtonState = saved ? 'success' : saveOutfit.isPending ? 'loading' : 'idle'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    saveOutfit.mutate(
      { name, itemIds, inCloset },
      {
        onSuccess: () => {
          setSaved(true)
          window.setTimeout(() => {
            setSaved(false)
            setName('')
            setInCloset(false)
            onClose()
          }, 700)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Guardar outfit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="outfit-name">
              Nombre <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="outfit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Domingo casual"
              maxLength={80}
            />
          </div>
          <Label className="flex items-start gap-3 font-normal">
            <Checkbox checked={inCloset} onCheckedChange={(checked) => setInCloset(checked === true)} />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Mostrar en mi closet</span>
              <span className="text-xs text-muted-foreground">
                Aparece en la seccion Closet de tu perfil y cualquiera puede abrirlo con su link.
              </span>
            </span>
          </Label>
          {saveOutfit.isError && (
            <p role="alert" className="text-sm text-destructive">
              No se pudo guardar. Intenta de nuevo.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <StatefulButton type="submit" state={buttonState}>
              {buttonState === 'loading' ? 'Guardando' : buttonState === 'success' ? 'Guardado' : 'Guardar'}
            </StatefulButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
