import { Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { useSession } from '@/hooks/useAuth'
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites'
import type { Listing } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

// Corazon para guardar una venta. No sale sin sesion ni en tus propias ventas
export function FavoriteButton({ listing, className }: { listing: Listing; className?: string }) {
  const userId = useSession()?.user.id
  const saved = useFavoriteIds().has(listing.id)
  const toggle = useToggleFavorite()
  if (!userId || userId === listing.sellerId) return null

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Quitar de guardados' : 'Guardar venta'}
      onClick={() => toggle({ listingId: listing.id, saved: !saved })}
      className={cn(
        'touch-target flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      {/* Mismo saltito que el like de las publicaciones */}
      <motion.span
        key={String(saved)}
        initial={saved ? { scale: 0.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.5 }}
        className="flex"
      >
        <Heart className={cn('size-4', saved && 'fill-red-500 text-red-500')} />
      </motion.span>
    </button>
  )
}
