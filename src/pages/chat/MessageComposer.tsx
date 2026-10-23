import { Check, ImagePlus, Pencil, SendHorizontal, X } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { type ChatMessage, quickReplies } from '@/lib/chat'
import { cn } from '@/lib/utils'

// Los GIF se suben sin comprimir y el bucket acepta hasta 2 MB
const MAX_GIF_BYTES = 2 * 1024 * 1024

type MessageComposerProps = {
  // Respuestas rapidas para empezar la platica
  showQuickReplies: boolean
  onSend: (body: string, file?: File) => void
  // Mensaje tuyo que se esta editando: la caja empieza con su texto y al enviar se guarda el cambio
  editing: ChatMessage | null
  onEdit: (body: string) => void
  onCancelEdit: () => void
}

// Caja para escribir: Enter envia y Shift+Enter hace un salto de linea. Se puede mandar
// solo texto, solo una foto o GIF, o las dos cosas
export function MessageComposer({ showQuickReplies, onSend, editing, onEdit, onCancelEdit }: MessageComposerProps) {
  const [text, setText] = useState(editing?.body ?? '')
  const [image, setImage] = useState<File>()
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const body = text.trim()

  // Vista previa de la foto elegida
  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image])

  function send(event?: FormEvent) {
    event?.preventDefault()
    if (editing) {
      // Un mensaje con foto puede quedar sin texto; uno de solo texto no
      if (body || editing.imageUrl) onEdit(body)
      return
    }
    if (!body && !image) return
    onSend(body, image)
    setText('')
    setImage(undefined)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape' && editing) onCancelEdit()
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) send(event)
  }

  function pick(file: File | undefined) {
    if (!file?.type.startsWith('image/')) return
    if (file.type === 'image/gif' && file.size > MAX_GIF_BYTES) {
      setError('El GIF pesa mas de 2 MB, elige uno mas ligero')
      return
    }
    setError('')
    setImage(file)
  }

  return (
    <div className="flex flex-col gap-2 border-t-2 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {editing && (
        <div className="flex items-center justify-between gap-2 pl-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Pencil className="size-3.5" />
            Editando mensaje
          </span>
          <Button variant="ghost" size="icon-xs" onClick={onCancelEdit} aria-label="Cancelar edicion">
            <X />
          </Button>
        </div>
      )}
      {showQuickReplies && !editing && (
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
      {previewUrl && (
        <div className="relative self-start">
          <img src={previewUrl} alt="Imagen para enviar" className="max-h-24 rounded-lg border object-contain" />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="absolute -top-2 -right-2 rounded-full"
            onClick={() => setImage(undefined)}
            aria-label="Quitar imagen"
          >
            <X />
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      <form onSubmit={send} className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('size-10 shrink-0 rounded-full', editing && 'invisible')}
          onClick={() => fileRef.current?.click()}
          aria-label="Agregar imagen o GIF"
        >
          <ImagePlus />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            pick(event.target.files?.[0])
            // Permite volver a elegir la misma imagen despues de quitarla
            event.target.value = ''
          }}
        />
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          autoFocus={!!editing}
          placeholder="Escribe un mensaje"
          aria-label="Mensaje"
          rows={1}
          maxLength={2000}
          className="max-h-32 min-h-10 resize-none rounded-2xl"
        />
        <Button
          type="submit"
          size="icon"
          disabled={editing ? !body && !editing.imageUrl : !body && !image}
          aria-label={editing ? 'Guardar cambio' : 'Enviar'}
          className="size-10 shrink-0 rounded-full"
        >
          {editing ? <Check /> : <SendHorizontal />}
        </Button>
      </form>
    </div>
  )
}
