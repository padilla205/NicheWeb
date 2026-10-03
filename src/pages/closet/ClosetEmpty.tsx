import { Shirt } from 'lucide-react'
import { AddItemButton } from './AddItemButton'

type ClosetEmptyProps = {
  addOpen: boolean
  onAdd: (button: HTMLElement) => void
}

export function ClosetEmpty({ addOpen, onAdd }: ClosetEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Shirt className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">Tu closet esta vacio</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Agrega tu primera prenda para empezar.
      </p>
      <AddItemButton hidden={addOpen} onOpen={onAdd} />
    </div>
  )
}
