import { MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router'
import { PageTitle } from '@/components/PageTitle'
import { useConversations } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { ConversationList } from './ConversationList'
import { ConversationView } from './ConversationView'

const slide = { type: 'spring', visualDuration: 0.25, bounce: 0 } as const

// Mensajes: en escritorio la lista y el chat lado a lado; en celular el chat abierto entra
// desde la derecha encima de la lista, como otra pantalla
export function ChatPage() {
  const { id } = useParams()
  const { data: conversations } = useConversations()
  const [isDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)

  const view = (
    <AnimatePresence initial={isDesktop}>
      {id && (
        <motion.div
          key={id}
          initial={isDesktop ? { opacity: 0, x: 24 } : { x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          // En escritorio el chat anterior se va de golpe para no encimarse con el nuevo
          exit={isDesktop ? { opacity: 0, transition: { duration: 0 } } : { x: '100%' }}
          transition={slide}
          className={cn(
            isDesktop ? 'col-start-2 row-start-1 min-h-0' : 'fixed inset-0 z-50 h-dvh shadow-2xl',
          )}
        >
          <ConversationView id={id} conversation={conversations?.find((conversation) => conversation.id === id)} />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="md:mx-auto md:max-w-6xl">
      <PageTitle title="Mensajes" />
      <div className="md:grid md:h-[calc(100dvh-4rem-3rem-4rem)] md:grid-cols-[22rem_minmax(0,1fr)] md:overflow-hidden md:rounded-2xl md:border-2">
        <aside className="md:col-start-1 md:row-start-1 md:flex md:min-h-0 md:flex-col md:border-r-2">
          <ConversationList conversations={conversations} activeId={id} />
        </aside>
        {isDesktop && !id && (
          <div className="col-start-2 row-start-1 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="size-8" strokeWidth={1.5} />
            Elige un chat para verlo aqui
          </div>
        )}
        {/* En celular el chat va fuera de la pagina para cubrir toda la pantalla */}
        {isDesktop ? view : createPortal(view, document.body)}
      </div>
    </div>
  )
}
