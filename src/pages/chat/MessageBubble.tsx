import { Ban, Check, Clock, Expand, Pencil, RotateCw, Shirt, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSession } from '@/hooks/useAuth'
import { useDeleteMessage, useToggleReaction } from '@/hooks/useChat'
import {
  canChangeMessage,
  type ChatMessage,
  formatMessageTime,
  reactionEmojis,
  type SharedContent,
  sharedLink,
} from '@/lib/chat'
import { cn } from '@/lib/utils'
import { RollingNumber } from '@/components/RollingNumber'
import { ChatImage } from './ChatImage'

type MessageBubbleProps = {
  message: ChatMessage
  mine: boolean
  onRetry: () => void
  onEdit: () => void
}

// Un mensaje: los tuyos a la derecha con el color principal, los del otro a la izquierda en gris.
// Los que llegan con el chat abierto nacen desde abajo, del lado de quien los manda.
// Al tocarlo sale un menu con reacciones y, en los tuyos recientes, editar y borrar
export function MessageBubble({ message, mine, onRetry, onEdit }: MessageBubbleProps) {
  const failed = message.status === 'failed'
  const [menuOpen, setMenuOpen] = useState(false)
  const [viewing, setViewing] = useState(false)

  return (
    <motion.div
      initial={message.isNew ? { opacity: 0, y: 12, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.15 }}
      style={{ originX: mine ? 1 : 0, originY: 1 }}
      className={cn('flex max-w-[80%] flex-col gap-0.5', mine ? 'items-end self-end' : 'items-start self-start')}
    >
      {message.deleted ? (
        <p className="flex items-center gap-1.5 rounded-2xl border border-dashed px-3.5 py-2 text-sm text-muted-foreground italic">
          <Ban className="size-3.5" />
          Mensaje eliminado
        </p>
      ) : (
        <>
        {message.shared && <SharedCard shared={message.shared} />}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          {/* Mientras se envia (o si fallo) todavia no existe en la base de datos: no hay menu */}
          <PopoverTrigger
            disabled={!!message.status}
            className={cn(
              'flex flex-col gap-1 rounded-2xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              mine ? 'items-end' : 'items-start',
            )}
          >
            {message.thumbUrl && (
              <img
                src={message.thumbUrl}
                alt="Imagen del mensaje"
                loading="lazy"
                className="max-h-72 max-w-full rounded-2xl border bg-muted object-contain"
              />
            )}
            {message.body && (
              <span
                className={cn(
                  'block rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap',
                  mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted',
                  failed && 'bg-destructive/15 text-destructive',
                )}
              >
                {message.body}
              </span>
            )}
          </PopoverTrigger>
          <MessageMenu
            message={message}
            mine={mine}
            onView={() => setViewing(true)}
            onEdit={onEdit}
            onClose={() => setMenuOpen(false)}
          />
        </Popover>
        </>
      )}

      {!message.deleted && <Reactions message={message} />}

      {failed ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1 rounded px-1 text-xs text-destructive hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <RotateCw className="size-3" />
          No se envio, toca para reintentar
        </button>
      ) : (
        <span className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground tabular-nums">
          {message.editedAt && !message.deleted && <span>editado</span>}
          {formatMessageTime(message.createdAt)}
          {mine &&
            (message.status === 'sending' ? (
              <Clock aria-label="Enviando" className="size-3" />
            ) : (
              <Check aria-label="Enviado" className="size-3" />
            ))}
        </span>
      )}

      {message.imageUrl && message.thumbUrl && (
        <ChatImage
          id={message.id}
          imageUrl={message.imageUrl}
          thumbUrl={message.thumbUrl}
          open={viewing}
          onOpenChange={setViewing}
        />
      )}
    </motion.div>
  )
}

type MessageMenuProps = {
  message: ChatMessage
  mine: boolean
  onView: () => void
  onEdit: () => void
  onClose: () => void
}

// Las 4 reacciones arriba y abajo las acciones: ver la foto, editar y borrar
function MessageMenu({ message, mine, onView, onEdit, onClose }: MessageMenuProps) {
  const userId = useSession()?.user.id
  const toggleReaction = useToggleReaction()
  const deleteMessage = useDeleteMessage()
  // Borrar pide un segundo toque para confirmar
  const [confirmDelete, setConfirmDelete] = useState(false)
  const myEmoji = message.reactions?.find((r) => r.userId === userId)?.emoji
  const changeable = mine && canChangeMessage(message)

  return (
    <PopoverContent
      side="top"
      align={mine ? 'end' : 'start'}
      className="flex w-auto flex-col gap-1 rounded-2xl p-1.5"
      onCloseAutoFocus={() => setConfirmDelete(false)}
    >
      <div className="flex gap-1" role="group" aria-label="Reacciones">
        {reactionEmojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            aria-pressed={myEmoji === emoji}
            onClick={() => {
              toggleReaction({ message, emoji })
              onClose()
            }}
            className={cn(
              'flex size-11 items-center justify-center rounded-full text-2xl transition-[background-color,scale] duration-150 outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:active:scale-90',
              myEmoji === emoji && 'bg-accent',
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      {(message.imageUrl || changeable) && (
        <div className="flex flex-col border-t pt-1">
          {message.imageUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onView()
                onClose()
              }}
            >
              <Expand />
              Ver imagen
            </Button>
          )}
          {changeable && message.body && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => {
                onEdit()
                onClose()
              }}
            >
              <Pencil />
              Editar
            </Button>
          )}
          {changeable && (
            <Button
              variant={confirmDelete ? 'destructive' : 'ghost'}
              size="sm"
              className={cn('justify-start', !confirmDelete && 'text-destructive hover:text-destructive')}
              onClick={() => {
                if (!confirmDelete) return setConfirmDelete(true)
                deleteMessage(message)
                onClose()
              }}
            >
              <Trash2 />
              {confirmDelete ? 'Toca otra vez para borrar' : 'Borrar'}
            </Button>
          )}
        </div>
      )}
    </PopoverContent>
  )
}

// Reacciones pegadas abajo del mensaje; si los dos ponen la misma, se ve una vez con un 2
function Reactions({ message }: { message: ChatMessage }) {
  const reactions = message.reactions ?? []
  if (reactions.length === 0) return null
  const counts = new Map<string, number>()
  for (const { emoji } of reactions) counts.set(emoji, (counts.get(emoji) ?? 0) + 1)

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.3 }}
      className="-mt-2 flex items-center gap-0.5 rounded-full border bg-background px-1.5 py-0.5 text-sm shadow-sm"
    >
      {[...counts].map(([emoji, count]) => (
        <span key={emoji} className="flex items-center">
          {emoji}
          {/* El contador rueda al sumar o quitar una reaccion */}
          <RollingNumber value={count} className="ml-0.5 text-xs text-muted-foreground" />
        </span>
      ))}
    </motion.span>
  )
}

// Publicacion o prenda compartida: al tocarla se abre; si ya no existe, solo lo avisa
function SharedCard({ shared }: { shared: SharedContent }) {
  const content = (
    <>
      {shared.thumbUrl ? (
        <img src={shared.thumbUrl} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Shirt className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </span>
      )}
      <span className="flex min-w-0 flex-col text-sm">
        <span className="truncate font-medium">{shared.title}</span>
        <span className="truncate text-muted-foreground">{shared.subtitle}</span>
      </span>
    </>
  )
  const className = 'flex w-64 max-w-full items-center gap-3 rounded-2xl border bg-card p-2 text-left'

  return shared.id ? (
    <Link to={sharedLink(shared)} className={cn(className, 'transition-colors duration-150 hover:bg-accent')}>
      {content}
    </Link>
  ) : (
    <div className={cn(className, 'opacity-70')}>{content}</div>
  )
}
