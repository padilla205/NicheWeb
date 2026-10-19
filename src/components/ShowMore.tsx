import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ShowMoreProps = {
  shown: number
  total: number
  onClick: () => void
}

// Final de una lista por bloques: cuantos se ven y el boton para cargar el siguiente bloque
export function ShowMore({ shown, total, onClick }: ShowMoreProps) {
  if (shown >= total) return null

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <Button variant="outline" className="rounded-full" onClick={onClick}>
        <ChevronDown />
        Ver mas
      </Button>
      <p className="text-xs text-muted-foreground tabular-nums">
        Mostrando {shown} de {total}
      </p>
    </div>
  )
}
