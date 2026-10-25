import { Ban, Flag, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { ReportDialog } from '@/components/ReportDialog'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBlockState, useToggleBlock } from '@/hooks/useChat'

// Tres puntos en el perfil de otra persona: bloquear (con doble toque) o reportar
export function ProfileMoreMenu({ userId, username }: { userId: string; username: string }) {
  const [open, setOpen] = useState(false)
  const [confirmBlock, setConfirmBlock] = useState(false)
  const [reporting, setReporting] = useState(false)
  const blockedByMe = useBlockState(userId) === 'blocked-by-me'
  const toggleBlock = useToggleBlock()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setConfirmBlock(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Mas opciones">
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-64 flex-col gap-1 p-1.5">
          <Button
            variant={confirmBlock ? 'destructive' : 'ghost'}
            className={blockedByMe ? 'w-full justify-start' : 'w-full justify-start text-destructive hover:text-destructive'}
            onClick={() => {
              if (!blockedByMe && !confirmBlock) return setConfirmBlock(true)
              toggleBlock({ otherId: userId, blocked: !blockedByMe })
              setOpen(false)
            }}
          >
            <Ban />
            {blockedByMe ? 'Desbloquear usuario' : confirmBlock ? 'Toca otra vez para bloquear' : `Bloquear a @${username}`}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => {
              setOpen(false)
              setReporting(true)
            }}
          >
            <Flag />
            Reportar perfil
          </Button>
        </PopoverContent>
      </Popover>
      <ReportDialog open={reporting} onClose={() => setReporting(false)} type="profile" id={userId} />
    </>
  )
}
