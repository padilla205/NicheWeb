import { SendHorizontal } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { quickReplies } from '@/lib/chat'

type MessageComposerProps = {
  // Respuestas rapidas para empezar la platica
  showQuickReplies: boolean
  onSend: (body: string) => void
}

// Caja para escribir: Enter envia y Shift+Enter hace un salto de linea
export function MessageComposer({ showQuickReplies, onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const body = text.trim()

  function send(event?: FormEvent) {
    event?.preventDefault()
    if (!body) return
    onSend(body)
    setText('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) send(event)
  }

  return (
    <div className="flex flex-col gap-2 border-t-2 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {showQuickReplies && (
        <div className="flex gap-2 overflow-x-auto">
          {quickReplies.map((reply) => (
            <Button
              key={reply}
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full"
              onClick={() => onSend(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={send} className="flex items-end gap-2">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Escribe un mensaje"
          aria-label="Mensaje"
          rows={1}
          maxLength={2000}
          className="max-h-32 min-h-10 resize-none rounded-2xl"
        />
        <Button type="submit" size="icon" disabled={!body} aria-label="Enviar" className="size-10 shrink-0 rounded-full">
          <SendHorizontal />
        </Button>
      </form>
    </div>
  )
}
