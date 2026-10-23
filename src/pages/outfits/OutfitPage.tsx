import { ArrowLeft, Shirt } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { OutfitBoard } from '@/components/OutfitBoard'
import { Button } from '@/components/ui/button'
import { useOutfit } from '@/hooks/useOutfits'
import { getTypeInfo } from '@/lib/clothing'
import { piecesOf } from '@/lib/outfits'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { EmptyTab } from '@/pages/profile/EmptyTab'

// Un outfit abierto por su link (/o/:id); se puede ver sin cuenta si es publico
export function OutfitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: outfit, isPending } = useOutfit(id)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Button variant="ghost" size="sm" className="-ml-2 self-start" onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </Button>

      {isPending ? (
        <div aria-hidden className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-3xl bg-muted" />
          <div className="flex flex-col gap-3">
            <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : !outfit ? (
        <EmptyTab>Este outfit no existe o es privado.</EmptyTab>
      ) : (
        <article className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border bg-card">
            <OutfitBoard pieces={piecesOf(outfit.items)} />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{outfit.name || 'Outfit'}</h1>
            <Link to={`/u/${outfit.owner.username}`} className="flex items-center gap-3 self-start hover:underline">
              <UserAvatar user={outfit.owner} className="size-9" />
              <span className="text-sm">
                <span className="font-medium">{outfit.owner.name}</span>{' '}
                <span className="text-muted-foreground">@{outfit.owner.username}</span>
              </span>
            </Link>
            <section aria-label="Prendas" className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">Prendas</h2>
              <ul className="flex flex-col gap-2">
                {outfit.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-xl border p-2">
                    {item.thumbUrl ? (
                      <img src={item.thumbUrl} alt="" loading="lazy" className="size-12 rounded-lg object-cover" />
                    ) : (
                      <span className="flex size-12 items-center justify-center rounded-lg bg-muted">
                        <Shirt className="size-5 text-muted-foreground" strokeWidth={1.5} />
                      </span>
                    )}
                    <span className="flex flex-col text-sm">
                      <span className="font-medium">{item.name || getTypeInfo(item.type).label}</span>
                      <span className="text-muted-foreground">{getTypeInfo(item.type).label}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      )}
    </div>
  )
}
