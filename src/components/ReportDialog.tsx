import { Check, Flag } from 'lucide-react'
import { useState } from 'react'
import { ChoicePill } from '@/components/ChoicePill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlreadyReportedError, useReport } from '@/hooks/useReports'
import { REPORT_REASONS, type ReportReason, type ReportTargetType, TARGET_LABELS } from '@/lib/reports'

type ReportDialogProps = {
  open: boolean
  onClose: () => void
  type: ReportTargetType
  id: string
}

// Boton "Reportar" que abre su propia ventana (ventas, perfiles)
export function ReportButton({ type, id, label }: { type: ReportTargetType; id: string; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="self-center text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Flag />
        {label}
      </Button>
      <ReportDialog open={open} onClose={() => setOpen(false)} type={type} id={id} />
    </>
  )
}

// Reportar algo: motivo, un comentario opcional y listo. Lo revisa el equipo de Niche
export function ReportDialog({ open, onClose, type, id }: ReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="gap-4 sm:max-w-md">
        {/* key: cada vez que se abre empieza vacio */}
        {open && <ReportForm key={id} type={type} id={id} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function ReportForm({ type, id, onClose }: Omit<ReportDialogProps, 'open'>) {
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [done, setDone] = useState('')
  const [error, setError] = useState('')
  const report = useReport()

  async function send() {
    if (!reason) return
    setError('')
    try {
      await report.mutateAsync({ type, id, reason, details })
      setDone('Gracias por avisarnos. Lo vamos a revisar.')
    } catch (failure) {
      if (failure instanceof AlreadyReportedError) setDone(failure.message)
      else setError('No se pudo enviar el reporte, intenta de nuevo')
    }
  }

  if (done) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="size-5" />
            Reporte enviado
          </DialogTitle>
          <DialogDescription>{done}</DialogDescription>
        </DialogHeader>
        <Button onClick={onClose}>Listo</Button>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reportar {TARGET_LABELS[type].toLowerCase()}</DialogTitle>
        <DialogDescription>Tu reporte es anonimo: la otra persona no sabra quien lo hizo.</DialogDescription>
      </DialogHeader>
      <div role="group" aria-label="Motivo" className="flex flex-wrap gap-2">
        {REPORT_REASONS.map((option) => (
          <ChoicePill
            key={option.value}
            active={reason === option.value}
            onClick={() => setReason(option.value)}
            slideId="report-reason"
          >
            {option.label}
          </ChoicePill>
        ))}
      </div>
      <Textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        maxLength={500}
        placeholder="Cuentanos que paso (opcional)"
        aria-label="Detalles del reporte"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="destructive" disabled={!reason || report.isPending} onClick={send}>
          {report.isPending ? 'Enviando' : 'Enviar reporte'}
        </Button>
      </div>
    </>
  )
}
