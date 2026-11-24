import { ExternalLink, TrendingDown, TrendingUp } from 'lucide-react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { GarmentScan } from '@/lib/garmentScan'
import { cn } from '@/lib/utils'
import { PriceHistoryChart } from './PriceHistoryChart'

const money = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })

// Cifra que sube desde 0 hasta su valor, como un contador (sin movimiento si el sistema lo pide)
function useCountUp(value: number, delay: number) {
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = useState(reduceMotion ? value : 0)
  useEffect(() => {
    if (reduceMotion) return
    const controls = animate(0, value, { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) })
    return () => controls.stop()
  }, [value, delay, reduceMotion])
  return reduceMotion ? value : shown
}

// "Cuanto vale tu prenda": lo mas llamativo del resultado. Va justo despues de la descripcion, en una
// tarjeta negra: el rango de precio contando hacia arriba, de donde sale el dato y la grafica de los
// ultimos 5 años
export function PriceReveal({ price }: { price: GarmentScan['price'] }) {
  // Las dos cifras suben juntas, asi el minimo nunca pasa al maximo mientras cuentan
  const min = useCountUp(price.min, 0.55)
  const max = useCountUp(price.max, 0.55)
  // Precio del ultimo año de la grafica y si subio respecto al primero
  const today = price.history.at(-1)?.price ?? Math.round((price.min + price.max) / 2)
  const rising = (price.history.at(-1)?.price ?? 0) >= (price.history[0]?.price ?? 0)
  const Trend = rising ? TrendingUp : TrendingDown

  return (
    <motion.section
      aria-label={`Vale entre ${money.format(price.min)} y ${money.format(price.max)} pesos`}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.2, delay: 0.45 }}
      className="dark rounded-3xl bg-neutral-950 p-5 text-foreground shadow-[0_24px_48px_-24px_rgb(0_0_0/0.55)] ring-1 ring-black/5 dark:ring-white/10"
    >
      <p className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Cuanto vale tu prenda
        <span className="rounded-full border border-white/15 px-2 py-0.5 tracking-normal normal-case">MXN</span>
      </p>
      {/* En una sola linea y con tamaño que se ajusta al ancho: en celulares chicos no se enciman las cifras */}
      <p aria-hidden className="mt-4 text-[clamp(1.9rem,10.5vw,2.75rem)] leading-tight font-bold tracking-tight whitespace-nowrap tabular-nums">
        <span className="text-[0.55em] text-muted-foreground">MX$</span>
        {money.format(min)}
        <span className="text-muted-foreground"> – </span>
        {money.format(max)}
      </p>
      <p className="mt-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-pretty">
        {price.basis === 'reventa' ? `Segun ${price.found} ventas de reventa` : 'Estimado: sin ventas de este modelo'}
      </p>

      {/* Cuadro que resalta: lo que vale hoy y si conviene vender, en blanco para que se distinga */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-4 text-black shadow-[0_0_0_4px_rgb(255_255_255/0.08)]">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full text-white', rising ? 'bg-emerald-600' : 'bg-red-500')}>
          <Trend className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-black/60">Hoy se vende en</p>
          <p className="text-xl leading-tight font-bold tabular-nums">MX${money.format(today)}</p>
          <p className="text-sm font-medium text-pretty">{rising ? 'Buen momento para vender' : 'Su precio va bajando: si la vendes, mejor pronto'}</p>
        </div>
      </div>

      {/* La grafica en su propio recuadro */}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Ultimos 5 años</p>
        <PriceHistoryChart points={price.history} estimated={price.basis === 'estimado'} />
      </div>

      {price.sources.length > 0 && (
        <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 px-4">
          {price.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 py-3 text-sm hover:underline">
                <span className="truncate">{source.title}</span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  )
}
