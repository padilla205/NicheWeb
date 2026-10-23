import { ArrowLeft, ChevronUp } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { Fragment, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useAuth'
import { useMarkChatRead, useMessages, useSendMessage } from '@/hooks/useChat'
import { type Conversation, formatMessageDay } from '@/lib/chat'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { ChatListingCard } from './ChatListingCard'
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
          <>
            <UserAvatar user={conversation.other} className="size-9" />
            <div className="min-w-0 text-sm">
              <p className="truncate font-medium">{conversation.other.name}</p>
              <p className="truncate text-muted-foreground">@{conversation.other.username}</p>
            </div>
          </>
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
                    onRetry={() => send({ conversationId: id, body: message.body, id: message.id })}
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

      <MessageComposer
        showQuickReplies={!isPending && messages.length === 0 && !!conversation?.isBuyer}
        onSend={(body) => send({ conversationId: id, body })}
      />
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
