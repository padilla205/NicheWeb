import { ArrowLeft, ChevronRight, FileText, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const rowClass =
  'flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors duration-150 hover:bg-accent'

// Opciones de la cuenta que no se usan a diario: aviso de privacidad, terminos y borrar la cuenta
export function MoreOptionsPage() {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Button variant="ghost" size="sm" className="-mb-4 -ml-2 self-start" onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </Button>
      <PageTitle title="Mas opciones" />

      <section aria-labelledby="legal" className="flex flex-col gap-1 rounded-2xl border bg-card p-1.5">
        <h2 id="legal" className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
          Legal
        </h2>
        <Link to="/privacidad" className={rowClass}>
          <ShieldCheck className="size-4 text-muted-foreground" />
          <span className="flex-1">Aviso de privacidad</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <Link to="/terminos" className={rowClass}>
          <FileText className="size-4 text-muted-foreground" />
          <span className="flex-1">Terminos de uso</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>

      <section aria-labelledby="cuenta" className="flex flex-col gap-1 rounded-2xl border border-destructive/40 bg-card p-1.5">
        <h2 id="cuenta" className="px-3 pt-2 pb-1 text-xs font-medium text-destructive">
          Cuenta
        </h2>
        <button type="button" onClick={() => setDeleting(true)} className={`${rowClass} text-left text-destructive`}>
          <Trash2 className="size-4" />
          <span className="flex-1">Borrar mi cuenta</span>
          <ChevronRight className="size-4" />
        </button>
      </section>

      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} />
    </div>
  )
}
