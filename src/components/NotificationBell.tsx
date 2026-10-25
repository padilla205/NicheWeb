import { Bell, Heart, MessageCircle, Repeat2, TrendingDown, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { UnreadBadge } from '@/components/UnreadBadge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSession } from '@/hooks/useAuth'
import {
  type AppNotification,
  type NotificationType,
  useMarkNotificationsRead,
  useNotifications,
  useNotificationsRealtime,
} from '@/hooks/useNotifications'
import { formatTimeAgo } from '@/lib/feed'
import { topBarIconClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/pages/feed/UserAvatar'

const typeInfo: Record<NotificationType, { text: string; icon: typeof Heart; className: string }> = {
  like: { text: 'le gusto tu publicacion', icon: Heart, className: 'fill-red-500 text-red-500' },
  comment: { text: 'comento tu publicacion', icon: MessageCircle, className: 'text-primary' },
  reply: { text: 'respondio a tu comentario', icon: MessageCircle, className: 'text-primary' },
  comment_like: { text: 'le gusto tu comentario', icon: Heart, className: 'fill-red-500 text-red-500' },
  price_drop: { text: 'bajo el precio de una venta que guardaste', icon: TrendingDown, className: 'text-primary' },
  share: { text: 'compartio tu publicacion', icon: Repeat2, className: 'text-primary' },
  follow: { text: 'empezo a seguirte', icon: UserPlus, className: 'text-primary' },
}

// Campanita de la barra de arriba: se mueve cuando llega algo nuevo y abre la lista de avisos
export function NotificationBell() {
  const session = useSession()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const [open, setOpen] = useState(false)
  // Cuenta las que llegan en vivo: cada una hace que la campanita se mueva otra vez
  const [rings, setRings] = useState(0)
  // Las que no se habian leido al abrir: conservan su punto un momento aunque ya se marcaron
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  useNotificationsRealtime(() => setRings((count) => count + 1))

  const unread = notifications.filter((item) => !item.read).length

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next && unread > 0) {
      setFresh(new Set(notifications.filter((item) => !item.read).map((item) => item.id)))
      markRead()
    }
  }

  // Sin sesion (paginas publicas) no hay notificaciones
  if (!session) return null

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
        title="Notificaciones"
        className={cn(topBarIconClass, open && 'bg-accent text-foreground')}
      >
        {/* Se balancea un instante cuando llega una notificacion */}
        <motion.span
          key={rings}
          initial={rings > 0 ? { rotate: 0 } : false}
          animate={rings > 0 ? { rotate: [0, -18, 14, -8, 4, 0] } : undefined}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{ originY: 0.15 }}
          className="flex"
        >
          <Bell aria-hidden="true" className="size-5" />
        </motion.span>
        <UnreadBadge count={unread} className="absolute top-0 right-0" />
      </PopoverTrigger>

      <PopoverContent align="end" className="flex max-h-[70dvh] w-[min(24rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0">
        <h2 className="border-b px-4 py-3 text-sm font-semibold">Notificaciones</h2>
        {notifications.length === 0 ? (
          <p className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
            <Bell className="size-6" strokeWidth={1.5} />
            Aqui veras cuando alguien de like, comente, comparta o te siga.
          </p>
        ) : (
          <ul className="flex flex-col overflow-y-auto p-1.5">
            {/* Al abrir aparecen en cascada; las que llegan con el panel abierto entran igual, arriba */}
            {notifications.map((item, index) => (
              <li
                key={item.id}
                style={{ animation: `notif-in 0.25s ease-out ${Math.min(index, 8) * 40}ms both` }}
              >
                <NotificationRow item={item} fresh={fresh.has(item.id)} onOpen={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationRow({ item, fresh, onOpen }: { item: AppNotification; fresh: boolean; onOpen: () => void }) {
  const { text, icon: Icon, className } = typeInfo[item.type]
  // Lo que se abre al tocarla: la publicacion, la venta o el perfil de quien te siguio
  const to = item.postId
    ? `/p/${item.postId}`
    : item.listingId
      ? `/marketplace/${item.listingId}`
      : `/u/${item.actor.username}`

  return (
    <Link
      to={to}
      onClick={onOpen}
      className="relative flex items-center gap-3 rounded-xl p-2.5 text-sm transition-colors duration-150 hover:bg-accent"
    >
      <span className="relative z-10 shrink-0">
        <UserAvatar user={item.actor} className="size-10" />
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-popover bg-popover">
          <Icon className={cn('size-3', className)} />
        </span>
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span className="line-clamp-2">
          <span className="font-medium">{item.actor.username}</span> {text}
          {item.commentText && <span className="text-muted-foreground">: {item.commentText}</span>}
        </span>
        <span className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
      </span>
      {item.thumbUrl && (
        <img src={item.thumbUrl} alt="" loading="lazy" className="relative z-10 size-11 shrink-0 rounded-lg object-cover" />
      )}
      {/* Las nuevas se ven resaltadas al abrir y el resaltado se desvanece despues de un momento */}
      {fresh && (
        <span
          aria-hidden
          style={{ animation: 'notif-fade 0.6s ease-out 2s forwards' }}
          className="pointer-events-none absolute inset-0 rounded-xl bg-primary/15"
        />
      )}
    </Link>
  )
}
