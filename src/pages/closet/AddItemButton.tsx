import { Plus } from 'lucide-react'
import { MorphButton } from '@/components/MorphButton'

type AddItemButtonProps = {
  hidden: boolean
  onOpen: (button: HTMLElement) => void
  className?: string
}

export function AddItemButton({ hidden, onOpen, className }: AddItemButtonProps) {
  return (
    <MorphButton hidden={hidden} onOpen={onOpen} className={className}>
      <Plus />
      Agregar prenda
    </MorphButton>
  )
}
