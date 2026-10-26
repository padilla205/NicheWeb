import { Check, Link2, Send, Shirt, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { OutfitBoard } from '@/components/OutfitBoard'
import { ConfirmDelete } from '@/components/ConfirmDelete'
import { Button } from '@/components/ui/button'
import { useDeleteOutfit, useMakeOutfitPublic, useSetOutfitInCloset } from '@/hooks/useOutfits'
import { type Outfit, piecesOf } from '@/lib/outfits'
import { cn } from '@/lib/utils'

type OutfitCardProps = {
  outfit: Outfit
  // Sin esto la tarjeta solo se ve (perfil de otra persona)
  onPublish?: (button: HTMLElement) => void
}

// Outfit guardado: el outfit armado, su nombre y, si es tuyo, sus opciones
export function OutfitCard({ outfit, onPublish }: OutfitCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Link to={`/o/${outfit.id}`} aria-label={`Ver ${outfit.name || 'outfit'}`} className="block bg-muted/30">
        <OutfitBoard pieces={piecesOf(outfit.items)} compact />
      </Link>
      <div className="flex flex-col gap-2 border-t p-3">
        <p className="truncate text-sm font-medium">{outfit.name || 'Outfit sin nombre'}</p>
        {onPublish && <OwnerActions outfit={outfit} onPublish={onPublish} />}
      </div>
    </article>
  )
}

function OwnerActions({ outfit, onPublish }: { outfit: Outfit; onPublish: (button: HTMLElement) => void }) {
  const setInCloset = useSetOutfitInCloset()
  const makePublic = useMakeOutfitPublic()
  const deleteOutfit = useDeleteOutfit()
  const [copied, setCopied] = useState(false)

  // El aviso de "Link copiado" se quita solo
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  // El link solo sirve si el outfit es publico: primero se hace publico y luego se copia
  function copyLink() {
    makePublic.mutate(outfit, {
      onSuccess: async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/o/${outfit.id}`)
          setCopied(true)
        } catch {
          // El navegador bloqueo el portapapeles; no se muestra el aviso
        }
      },
    })
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button size="sm" className="w-full" onClick={(event) => onPublish(event.currentTarget)}>
        <Send />
        Publicar
      </Button>
      <Button
        size="sm"
        variant="outline"
        aria-pressed={outfit.inCloset}
        title={outfit.inCloset ? 'Quitar de mi closet' : 'Mostrar en mi closet'}
        onClick={() => setInCloset.mutate({ outfit, inCloset: !outfit.inCloset })}
        className={cn('flex-1', outfit.inCloset && 'border-primary bg-primary/10')}
      >
        {outfit.inCloset ? <Check /> : <Shirt />}
        Closet
      </Button>
      <Button size="icon-sm" variant="outline" onClick={copyLink} aria-label="Copiar link" title="Copiar link">
        {copied ? <Check /> : <Link2 />}
      </Button>
      <ConfirmDelete
        title="Eliminar este outfit?"
        description="Tus prendas se quedan en tu closet. Si lo publicaste sin foto propia, esa publicacion tambien se borra. No se puede deshacer."
        onConfirm={() => deleteOutfit.mutate(outfit)}
      >
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Eliminar outfit"
          className="text-destructive hover:text-destructive"
          disabled={deleteOutfit.isPending}
        >
          <Trash2 />
        </Button>
      </ConfirmDelete>
      {copied && <p className="w-full text-xs text-muted-foreground">Link copiado</p>}
    </div>
  )
}
