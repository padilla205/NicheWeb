import { MessageCircle, Shirt } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { ChoicePill } from '@/components/ChoicePill'
import type { Conversation } from '@/lib/chat'
import { formatTimeAgo } from '@/lib/feed'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/pages/feed/UserAvatar'

type ConversationListProps = {
  conversations: Conversation[] | undefined
  activeId: string | undefined
}

// Tus chats separados en los que compras y los que vendes
export function ConversationList({ conversations, activeId }: ConversationListProps) {
  // Hasta que eliges una pestana, se ve la del chat abierto (o Comprando)
  const [chosen, setBuying] = useState<boolean>()
  const buying = chosen ?? conversations?.find((conversation) => conversation.id === activeId)?.isBuyer ?? true
  const shown = conversations?.filter((conversation) => conversation.isBuyer === buying)

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex gap-2 pb-3 md:p-3">
        <ChoicePill active={buying} onClick={() => setBuying(true)}>
          Comprando
        </ChoicePill>
        <ChoicePill active={!buying} onClick={() => setBuying(false)}>
          Vendiendo
        </ChoicePill>
      </div>

      {!shown ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <MessageCircle className="size-8" strokeWidth={1.5} />
          {buying
            ? 'Cuando le escribas a un vendedor, el chat aparece aqui'
            : 'Cuando alguien te escriba por una venta, el chat aparece aqui'}
        </div>
      ) : (
        <ul className="flex flex-col md:overflow-y-auto">
          {shown.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow conversation={conversation} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
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
          <p className="truncate font-medium">{other.name}</p>
          {lastMessageAt && (
            <span className="shrink-0 text-xs text-muted-foreground">{formatTimeAgo(lastMessageAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {listing?.thumbUrl ? (
            <img src={listing.thumbUrl} alt="" loading="lazy" className="size-4 shrink-0 rounded object-cover" />
          ) : (
            <Shirt className="size-4 shrink-0" strokeWidth={1.5} />
          )}
          <span className="truncate">{listing?.title ?? 'Venta no disponible'}</span>
        </div>
        <p className="truncate text-muted-foreground">{lastMessage ?? 'Chat nuevo, escribe el primer mensaje'}</p>
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
