import { Check, Clock, RotateCw } from 'lucide-react'
import { motion } from 'motion/react'
import { type ChatMessage, formatMessageTime } from '@/lib/chat'
import { cn } from '@/lib/utils'

type MessageBubbleProps = {
  message: ChatMessage
  mine: boolean
  onRetry: () => void
}

// Un mensaje: los tuyos a la derecha con el color principal, los del otro a la izquierda en gris.
// Los que llegan con el chat abierto nacen desde abajo, del lado de quien los manda
export function MessageBubble({ message, mine, onRetry }: MessageBubbleProps) {
  const failed = message.status === 'failed'

  return (
    <motion.div
      initial={message.isNew ? { opacity: 0, y: 12, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.15 }}
      style={{ originX: mine ? 1 : 0, originY: 1 }}
      className={cn('flex max-w-[80%] flex-col gap-0.5', mine ? 'items-end self-end' : 'items-start self-start')}
    >
      <p
        className={cn(
          'rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap',
          mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted',
          failed && 'bg-destructive/15 text-destructive',
        )}
      >
        {message.body}
      </p>
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
          {formatMessageTime(message.createdAt)}
          {mine &&
            (message.status === 'sending' ? (
              <Clock aria-label="Enviando" className="size-3" />
            ) : (
              <Check aria-label="Enviado" className="size-3" />
            ))}
        </span>
      )}
    </motion.div>
  )
}
