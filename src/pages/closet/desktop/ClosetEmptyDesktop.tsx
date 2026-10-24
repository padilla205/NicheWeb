import { Camera, Check, Lightbulb, Palette, Sparkles, Store } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { useClosetStats } from './ClosetStats'
import { AddItemButton } from '../AddItemButton'
import { ClosetRackIllustration } from './ClosetRackIllustration'

type ClosetEmptyDesktopProps = {
  addOpen: boolean
  onAdd: (button: HTMLElement) => void
}

// Closet vacio en escritorio: a la izquierda el mensaje con su ilustracion y a la derecha
// los primeros pasos para empezar
export function ClosetEmptyDesktop({ addOpen, onAdd }: ClosetEmptyDesktopProps) {
  // Pasos ya hechos segun los datos reales (nada se marca sin confirmarlo)
  const stats = useClosetStats()
  const done = {
    item: (stats.items ?? 0) > 0,
    colors: stats.hasColors,
    outfit: (stats.outfits ?? 0) > 0,
    listing: (stats.listings ?? 0) > 0,
  }
  const steps = [
    { icon: Camera, title: 'Sube tu primera prenda', text: 'Una foto basta para empezar.', done: done.item },
    { icon: Palette, title: 'Agrega categoria y color', text: 'Asi podras filtrar y combinar.', done: done.colors },
    { icon: Sparkles, title: 'Crea tu primer outfit', text: 'Arma combinaciones con tus prendas.', done: done.outfit, to: '/outfits' },
    { icon: Store, title: 'Publica una pieza en marketplace', text: 'Vende lo que ya no usas.', done: done.listing, to: '/marketplace' },
  ]

  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
      <section className="flex flex-col items-center justify-center rounded-3xl border bg-card px-10 py-14 text-center">
        <ClosetRackIllustration className="mb-6 w-56" />
        <h2 className="text-xl font-semibold tracking-tight">Tu closet esta vacio</h2>
        <p className="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
          Agrega tu primera prenda para empezar a organizar tu closet, crear outfits y prepararte para vender.
        </p>
        <AddItemButton hidden={addOpen} onOpen={onAdd} />
      </section>

      <section aria-labelledby="empieza-aqui" className="flex flex-col rounded-3xl border bg-card p-6">
        <h2 id="empieza-aqui" className="text-base font-semibold">
          Empieza aqui
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Sigue estos pasos para sacar el maximo provecho de tu closet.</p>
        <ol className="mt-5 mb-5 flex flex-col gap-1">
          {steps.map(({ icon: Icon, title, text, done: isDone, to }, index) => {
            const content = (
              <>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={cn('text-sm font-medium', isDone && 'text-muted-foreground line-through')}>
                    {index + 1}. {title}
                  </span>
                  <span className="text-xs text-muted-foreground">{text}</span>
                </span>
              </>
            )
            return (
              <li key={title}>
                {to ? (
                  <Link to={to} className="flex items-center gap-3 rounded-xl p-2 transition-colors duration-150 hover:bg-accent">
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-2">{content}</div>
                )}
              </li>
            )
          })}
        </ol>
        <p className="mt-auto flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Tip: usa fotos claras y fondo limpio para que tus prendas destaquen.
        </p>
      </section>
    </div>
  )
}
