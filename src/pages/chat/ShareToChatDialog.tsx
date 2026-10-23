import { Check, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useConversations, useSendMessage } from '@/hooks/useChat'
import type { SharedContent } from '@/lib/chat'
import { UserAvatar } from '@/pages/feed/UserAvatar'

type ShareToChatDialogProps = {
  open: boolean
  onClose: () => void
  shared: SharedContent
}

// Enviar una publicacion o prenda a uno o varios de tus chats
export function ShareToChatDialog({ open, onClose, shared }: ShareToChatDialogProps) {
  const { data: conversations, isPending } = useConversations()
  const send = useSendMessage()
  // Chats a los que ya se envio mientras la ventana esta abierta
  const [sent, setSent] = useState<string[]>([])
  // Mensaje opcional que va junto con la tarjeta
  const [text, setText] = useState('')

  function close() {
    setSent([])
    setText('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-h-[70dvh] gap-3 overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enviar por chat</DialogTitle>
          <DialogDescription>
            {shared.type === 'post' ? 'Elige a quien enviarle esta publicacion.' : 'Elige a quien enviarle esta prenda.'}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribe un mensaje (opcional)"
          aria-label="Mensaje"
          rows={2}
          maxLength={2000}
          className="min-h-16 resize-none"
        />
        {isPending ? (
          <div aria-hidden className="flex flex-col gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="size-9 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : conversations?.length === 0 ? (
          <p className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <MessageCircle className="size-6" strokeWidth={1.5} />
            Aun no tienes chats. Se crean al escribirle a alguien por una venta del marketplace.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {conversations?.map((conversation) => {
              const done = sent.includes(conversation.id)
              return (
                <li key={conversation.id} className="flex items-center gap-3 rounded-xl p-2">
                  <UserAvatar user={conversation.other} className="size-9" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{conversation.other.name}</p>
                    <p className="truncate text-muted-foreground">{conversation.listing?.title ?? 'Chat'}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={done ? 'outline' : 'default'}
                    disabled={done}
                    onClick={() => {
                      send({ conversationId: conversation.id, body: text.trim(), shared })
                      setSent([...sent, conversation.id])
                    }}
                  >
                    {done ? <Check /> : <Send />}
                    {done ? 'Enviado' : 'Enviar'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
