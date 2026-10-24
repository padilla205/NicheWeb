import { BellOff, MessageCircle, Shirt } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { ChoicePill } from '@/components/ChoicePill'
import { UnreadBadge } from '@/components/UnreadBadge'
import { useChatMutes, useUnreadCounts } from '@/hooks/useChat'
import { useKeepScroll } from '@/hooks/useKeepScroll'
import type { Conversation } from '@/lib/chat'
import { formatTimeAgo } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/pages/feed/UserAvatar'

type ConversationListProps = {
  conversations: Conversation[] | undefined
  activeId: string | undefined
}

type Tab = 'buying' | 'selling' | 'unread'

const tabs: { value: Tab; label: string; empty: string }[] = [
  { value: 'buying', label: 'Chats', empty: 'Escribele a alguien desde su perfil o a un vendedor desde su venta' },
  { value: 'selling', label: 'Vendiendo', empty: 'Cuando alguien te escriba por una venta, el chat aparece aqui' },
  { value: 'unread', label: 'No leido', empty: 'No tienes mensajes sin leer' },
]

// Tus chats separados en los que compras, los que vendes y los que tienen mensajes sin leer
export function ConversationList({ conversations, activeId }: ConversationListProps) {
  const unread = useUnreadCounts()
  const mutes = useChatMutes()
  // Hasta que eliges una pestana, se ve la del chat abierto (o Chats)
  const [chosen, setTab] = useState<Tab>()
  const active = conversations?.find((conversation) => conversation.id === activeId)
  const tab = chosen ?? (active && !active.isBuyer && !active.isDirect ? 'selling' : 'buying')

  function inTab(c: Conversation, value: Tab) {
    // Los mensajes directos van en Chats; Vendiendo es solo para tus ventas
    if (value === 'buying') return c.isBuyer || c.isDirect
    if (value === 'selling') return !c.isBuyer && !c.isDirect
    // El chat abierto se queda en "No leido" aunque al abrirlo ya quedo leido, para que no desaparezca
    return (unread[c.id] ?? 0) > 0 || c.id === activeId
  }

  const shown = conversations?.filter((conversation) => inTab(conversation, tab))
  // La pagina no sube al cambiar de pestana
  const keep = useKeepScroll(tab)
  // Sin leer en cada pestana (sin los silenciados), para notar los de la pestana que no estas viendo
  const tabUnread = (value: Tab) =>
    conversations?.reduce(
      (sum, c) => sum + (inTab(c, value) && !mutes.has(c.id) ? (unread[c.id] ?? 0) : 0),
      0,
    ) ?? 0

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap gap-2 pb-3 md:p-3">
        {tabs.map(({ value, label }) => (
          <ChoicePill key={value} slideId="chat-tab" active={tab === value} onClick={() => setTab(value)}>
            {label}
            <UnreadBadge count={tabUnread(value)} />
          </ChoicePill>
        ))}
      </div>

      <div ref={keep.ref} style={keep.style} className="flex min-h-0 flex-col">
        {!shown ? (
          <ListSkeleton />
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <MessageCircle className="size-8" strokeWidth={1.5} />
            {tabs.find((option) => option.value === tab)?.empty}
          </div>
        ) : (
          <ul className="flex flex-col md:overflow-y-auto">
            {shown.map((conversation) => (
              <li key={conversation.id}>
                <ConversationRow
                  conversation={conversation}
                  unread={unread[conversation.id] ?? 0}
                  muted={mutes.has(conversation.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

type ConversationRowProps = { conversation: Conversation; unread: number; muted: boolean }

function ConversationRow({ conversation, unread, muted }: ConversationRowProps) {
  const { listing, other, lastMessage, lastMessageAt } = conversation

  return (
    <NavLink
      to={`/chat/${conversation.id}`}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl p-3 transition-colors duration-150 hover:bg-accent md:mx-2',
          isActive && 'bg-accent',
        )
      }
    >
      <UserAvatar user={other} className="size-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1.5 font-medium">
            <span className="truncate">{other.name}</span>
            {muted && <BellOff aria-label="Silenciado" className="size-3.5 shrink-0 text-muted-foreground" />}
          </p>
          {lastMessageAt && (
            <span className="shrink-0 text-xs text-muted-foreground">{formatTimeAgo(lastMessageAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {conversation.isDirect ? (
            <MessageCircle className="size-4 shrink-0" strokeWidth={1.5} />
          ) : listing?.thumbUrl ? (
            <img src={listing.thumbUrl} alt="" loading="lazy" className="size-4 shrink-0 rounded object-cover" />
          ) : (
            <Shirt className="size-4 shrink-0" strokeWidth={1.5} />
          )}
          <span className="truncate">
            {conversation.isDirect ? 'Mensaje directo' : (listing?.title ?? 'Venta no disponible')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate', unread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {lastMessage ?? 'Chat nuevo, escribe el primer mensaje'}
          </p>
          <UnreadBadge count={unread} muted={muted} />
        </div>
      </div>
    </NavLink>
  )
}

function ListSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-1 md:px-2">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 p-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
