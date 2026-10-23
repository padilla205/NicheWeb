import { useCallback, useMemo, useState } from 'react'
import { PageTitle } from '@/components/PageTitle'
import { useAllItems } from '@/hooks/useItems'
import { useOutfits } from '@/hooks/useOutfits'
import { useProfile } from '@/hooks/useProfile'
import { comboKey, type Outfit, piecesOf } from '@/lib/outfits'
import { PublishPostDialog } from '@/pages/feed/PublishPostDialog'
import { EmptyTab } from '@/pages/profile/EmptyTab'
import { OutfitCard } from './OutfitCard'
import { OutfitGenerator } from './OutfitGenerator'

export function OutfitsPage() {
  const me = useProfile()
  const { data: items, isPending } = useAllItems()
  const { data: outfits } = useOutfits(me.id)
  // Outfit que se esta publicando y el boton que abrio la ventana
  const [publishing, setPublishing] = useState<{ outfit: Outfit; origin: HTMLElement } | null>(null)
  const closePublish = useCallback(() => setPublishing(null), [])
  const savedKeys = useMemo(() => (outfits ?? []).map((outfit) => comboKey(piecesOf(outfit.items))), [outfits])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <div>
        <PageTitle title="Outfits" />
        {isPending ? (
          <div aria-hidden className="mx-auto aspect-[3/4] w-full max-w-md animate-pulse rounded-3xl bg-muted" />
        ) : items && items.length > 0 ? (
          <OutfitGenerator items={items} savedKeys={savedKeys} />
        ) : (
          <EmptyTab>Agrega prendas a tu closet para empezar a armar outfits.</EmptyTab>
        )}
      </div>

      <section aria-labelledby="my-outfits" className="flex flex-col gap-4">
        <h2 id="my-outfits" className="text-lg font-semibold tracking-tight">
          Mis outfits <span className="text-muted-foreground tabular-nums">{outfits?.length ?? 0}</span>
        </h2>
        {outfits?.length === 0 ? (
          <EmptyTab>Cuando guardes un outfit aparecera aqui.</EmptyTab>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {outfits?.map((outfit) => (
              <li key={outfit.id}>
                <OutfitCard outfit={outfit} onPublish={(origin) => setPublishing({ outfit, origin })} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <PublishPostDialog origin={publishing?.origin ?? null} outfit={publishing?.outfit} onClose={closePublish} />
    </div>
  )
}
