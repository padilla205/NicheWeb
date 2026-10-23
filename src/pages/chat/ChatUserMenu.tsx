import { Ban, Bell, BellOff, ChevronDown, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBlockState, useChatMutes, useToggleBlock, useToggleMute } from '@/hooks/useChat'
import type { Conversation } from '@/lib/chat'
import { UserAvatar } from '@/pages/feed/UserAvatar'

const itemClass = 'w-full justify-start'

// Encabezado del chat: al tocar a la persona se abre un menu para ver su perfil, silenciar o bloquear
export function ChatUserMenu({ conversation }: { conversation: Conversation }) {
  const { id, other, otherId } = conversation
  const [open, setOpen] = useState(false)
  // Bloquear pide un segundo toque para confirmar
  const [confirmBlock, setConfirmBlock] = useState(false)
  const muted = useChatMutes().has(id)
  const toggleMute = useToggleMute()
  const blockedByMe = useBlockState(otherId) === 'blocked-by-me'
  const toggleBlock = useToggleBlock()

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setConfirmBlock(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="-ml-1 flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 text-left transition-colors duration-150 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50">
        <UserAvatar user={other} className="size-9" />
        <div className="min-w-0 text-sm">
          <p className="truncate font-medium">{other.name}</p>
          <p className="truncate text-muted-foreground">@{other.username}</p>
        </div>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-60 flex-col gap-1 p-1.5">
        <Button variant="ghost" className={itemClass} asChild>
          <Link to={`/u/${other.username}`}>
            <UserRound />
            Ver perfil
          </Link>
        </Button>
        <Button
          variant="ghost"
          className={itemClass}
          onClick={() => {
            toggleMute({ chat: id, muted: !muted })
            setOpen(false)
          }}
        >
          {muted ? <Bell /> : <BellOff />}
          {muted ? 'Quitar silencio' : 'Silenciar mensajes'}
        </Button>
        <Button
          variant={confirmBlock ? 'destructive' : 'ghost'}
          className={blockedByMe ? itemClass : `${itemClass} text-destructive hover:text-destructive`}
          onClick={() => {
            if (!blockedByMe && !confirmBlock) return setConfirmBlock(true)
            toggleBlock({ otherId, blocked: !blockedByMe })
            setOpen(false)
          }}
        >
          <Ban />
          {blockedByMe ? 'Desbloquear usuario' : confirmBlock ? 'Toca otra vez para bloquear' : 'Bloquear usuario'}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
