import { Plus, Shirt } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ClosetEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Shirt className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">Tu closet esta vacio</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Agrega tu primera prenda para empezar.
      </p>
      <Button>
        <Plus />
        Agregar prenda
      </Button>
    </div>
  )
}
