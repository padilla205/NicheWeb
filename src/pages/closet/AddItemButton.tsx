import { Plus } from 'lucide-react'
import { MorphButton } from '@/components/MorphButton'

type AddItemButtonProps = {
  hidden: boolean
  onOpen: (button: HTMLElement) => void
}

export function AddItemButton({ hidden, onOpen }: AddItemButtonProps) {
  return (
    <MorphButton hidden={hidden} onOpen={onOpen}>
      <Plus />
      Agregar prenda
    </MorphButton>
  )
}
