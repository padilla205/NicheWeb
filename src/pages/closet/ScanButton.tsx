import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SCANS_PER_DAY, useScansLeft } from '@/hooks/useGarmentScan'

// "Identificar con IA" con los escaneos que le quedan hoy. Es opcional: sin escaneos, la prenda se
// sigue pudiendo agregar llenando los datos a mano
export function ScanButton({ onScan }: { onScan: () => void }) {
  const { data: left } = useScansLeft()
  const none = left === 0
  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" className="w-full" disabled={none} onClick={onScan}>
        <Sparkles />
        Identificar con IA
      </Button>
      <p className="text-center text-xs text-muted-foreground tabular-nums">
        {none
          ? 'Ya usaste tus escaneos de hoy. Puedes llenar los datos a mano.'
          : left !== undefined && `Te quedan ${left} de ${SCANS_PER_DAY} escaneos hoy`}
      </p>
    </div>
  )
}
