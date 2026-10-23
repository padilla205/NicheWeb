import { ArrowLeft, ChevronUp } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Fragment, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useAuth'
import { useBlockState, useMarkChatRead, useMessages, useSendMessage, useToggleBlock } from '@/hooks/useChat'
import { type Conversation, formatMessageDay } from '@/lib/chat'
import { ChatListingCard } from './ChatListingCard'
import { ChatUserMenu } from './ChatUserMenu'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'

type ConversationViewProps = {
  id: string
  // undefined mientras carga la lista de chats
  conversation: Conversation | undefined
}

// Una conversacion: con quien hablas, los mensajes y la caja para escribir
export function ConversationView({ id, conversation }: ConversationViewProps) {
  const userId = useSession()?.user.id
  const { messages, isPending, hasOlder, loadOlder } = useMessages(id)
  const send = useSendMessage()
  const markRead = useMarkChatRead()
  const blockState = useBlockState(conversation?.otherId)
  const toggleBlock = useToggleBlock()

  // Con el chat abierto todo queda leido, tambien lo que llega mientras lo ves
  const newest = messages[0]?.id
  useEffect(() => {
    if (!isPending) markRead(id)
  }, [id, newest, isPending, markRead])

  return (
    <section aria-label="Conversacion" className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b-2 px-3 pt-[env(safe-area-inset-top)] box-content md:box-border md:pt-0">
        <Button variant="ghost" size="icon" className="md:hidden" asChild>
          <Link to="/chat" aria-label="Volver a mensajes">
            <ArrowLeft />
          </Link>
        </Button>
        {conversation ? (
          <ChatUserMenu conversation={conversation} />
        ) : (
          <div aria-hidden className="h-9 w-40 animate-pulse rounded-full bg-muted" />
        )}
      </header>

      {/* De abajo hacia arriba: el mensaje mas nuevo va primero y la vista arranca abajo, sin
          tener que mover el scroll. Al cargar mensajes anteriores la vista no brinca */}
      <div className="flex min-h-0 flex-1 flex-col-reverse gap-1.5 overflow-y-auto overscroll-contain p-4">
        {isPending ? (
          <MessagesSkeleton />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const older = messages[index + 1]
              const day = formatMessageDay(message.createdAt)
              return (
                <Fragment key={message.id}>
                  <MessageBubble
                    message={message}
                    mine={message.senderId === userId}
                    onRetry={() => send({ conversationId: id, body: message.body, file: message.file, id: message.id })}
                  />
                  {(!older || formatMessageDay(older.createdAt) !== day) && <DaySeparator label={day} />}
                </Fragment>
              )
            })}
          </AnimatePresence>
        )}
        {!isPending &&
          (hasOlder ? (
            <Button variant="ghost" size="sm" className="self-center rounded-full" onClick={loadOlder}>
              <ChevronUp />
              Ver mensajes anteriores
            </Button>
          ) : (
            conversation?.listing && <ChatListingCard listing={conversation.listing} />
          ))}
      </div>

      {blockState === 'none' ? (
        <MessageComposer
          showQuickReplies={!isPending && messages.length === 0 && !!conversation?.isBuyer}
          onSend={(body, file) => send({ conversationId: id, body, file })}
        />
      ) : (
        // Con un bloqueo de por medio no se puede escribir; a quien bloquearon no se le dice
        <div className="flex flex-col items-center gap-2 border-t-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center text-sm text-muted-foreground">
          {blockState === 'blocked-by-me' ? (
            <>
              <p>Bloqueaste a @{conversation?.other.username}. Ninguno de los dos puede escribir en este chat.</p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => toggleBlock({ otherId: conversation!.otherId, blocked: false })}
              >
                Desbloquear
              </Button>
            </>
          ) : (
            <p>No puedes enviar mensajes en este chat.</p>
          )}
        </div>
      )}
    </section>
  )
}

function DaySeparator({ label }: { label: string }) {
  return (
    <p className="my-2 self-center rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">{label}</p>
  )
}

// Burbujas grises a los dos lados mientras llegan los mensajes
function MessagesSkeleton() {
  return (
    <div aria-hidden className="flex flex-col-reverse gap-3">
      {['w-1/2 self-end', 'w-2/5', 'w-3/5 self-end', 'w-1/3'].map((size) => (
        <div key={size} className={`h-10 animate-pulse rounded-2xl bg-muted ${size}`} />
      ))}
    </div>
  )
}
