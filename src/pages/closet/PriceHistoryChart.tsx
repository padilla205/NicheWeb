import { TrendingDown, TrendingUp } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { type KeyboardEvent, type PointerEvent, useState } from 'react'

type PricePoint = { year: number; price: number }

type PriceHistoryChartProps = {
  points: PricePoint[]
  // Sin ventas reales la linea va mas tenue: es una estimacion
  estimated: boolean
}

const money = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })

// Grafica de lineas del precio de reventa por año. Hecha a mano con SVG (son 5 puntos, no vale una
// libreria). Al pasar el dedo o el mouse marca el año mas cercano y muestra su precio; con el
// teclado se mueve con las flechas. Los puntos y textos van en HTML para que no se deformen
export function PriceHistoryChart({ points, estimated }: PriceHistoryChartProps) {
  const [active, setActive] = useState(points.length - 1)
  const reduceMotion = useReducedMotion()
  const prices = points.map((p) => p.price)
  const low = Math.min(...prices) * 0.85
  const high = Math.max(...prices) * 1.1
  const toY = (price: number) => 100 - ((price - low) / (high - low)) * 100
  // Posicion de cada punto en porcentaje del area; 6% de margen a los lados para no cortar las orillas
  const xy = points.map((p, i) => ({
    x: points.length > 1 ? 6 + (i / (points.length - 1)) * 88 : 50,
    y: toY(p.price),
  }))
  const path = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  const ticks = [low + (high - low) * 0.2, low + (high - low) * 0.8]
  const current = points[active]
  const last = points.length - 1
  // Color de acento solo en la linea: verde si subio de precio en estos años, rojo si bajo.
  // El texto sigue en blanco y gris; la flecha y el porcentaje dicen lo mismo sin depender del color
  const change = Math.round(((points[last].price - points[0].price) / points[0].price) * 100)
  const up = change >= 0
  const accent = up ? '#34d399' : '#f87171'
  const Trend = up ? TrendingUp : TrendingDown

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = ((event.clientX - box.left) / box.width - 0.06) / 0.88
    setActive(Math.max(0, Math.min(last, Math.round(fraction * last))))
  }

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    setActive((i) => Math.max(0, Math.min(last, i + step)))
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-medium tabular-nums">
        <Trend className="size-4" style={{ color: accent }} aria-hidden />
        {up ? 'Subio' : 'Bajo'} {Math.abs(change)}% desde {points[0].year}
      </p>
      <div
        role="img"
        tabIndex={0}
        aria-label={`Precio en ${current.year}: MX$${money.format(current.price)}. Usa las flechas para ver otros años`}
        onPointerMove={pick}
        onPointerDown={pick}
        onKeyDown={move}
        className="relative h-40 touch-pan-y rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {/* Lineas guia, discretas, con su precio a la izquierda */}
        {ticks.map((tick) => (
          <div key={tick} className="absolute inset-x-0 border-t border-white/10" style={{ top: `${toY(tick)}%` }}>
            <span className="absolute -top-4 left-0 text-[10px] text-white/40 tabular-nums">
              ${money.format(Math.round(tick / 10) * 10)}
            </span>
          </div>
        ))}

        {/* La linea aparece con opacidad: animar el trazo deja huecos con non-scaling-stroke */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <motion.path
            d={path}
            fill="none"
            stroke={accent}
            strokeOpacity={estimated ? 0.55 : 1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          />
        </svg>

        {/* Linea vertical del año elegido */}
        <div className="absolute inset-y-0 w-px bg-white/25" style={{ left: `${xy[active].x}%` }} aria-hidden />

        {xy.map((p, i) => (
          <span
            key={points[i].year}
            aria-hidden
            className={
              i === active
                ? 'absolute size-3 -translate-1/2 rounded-full bg-white ring-4 ring-neutral-950'
                : 'absolute size-2 -translate-1/2 rounded-full bg-neutral-400 ring-2 ring-neutral-950'
            }
            style={{ left: `${p.x}%`, top: `${p.y}%`, ...(i === active && { boxShadow: `0 0 0 2px ${accent}` }) }}
          />
        ))}

        {/* Etiqueta del punto elegido, arriba de el y sin salirse de los bordes */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-lg bg-white px-2 py-1 text-xs font-semibold whitespace-nowrap text-black tabular-nums"
          style={{
            left: `${xy[active].x}%`,
            top: `calc(${xy[active].y}% - 12px)`,
            // Va en el estilo (no en la clase) porque cambia segun el punto; tambien la sube su propia altura
            translate: `${active === 0 ? '-12px' : active === last ? 'calc(-100% + 12px)' : '-50%'} -100%`,
          }}
        >
          {current.year} · ${money.format(current.price)}
        </div>
      </div>

      <div className="relative h-4 text-[11px] text-white/50 tabular-nums" aria-hidden>
        {points.map((p, i) => (
          <span key={p.year} className="absolute -translate-x-1/2" style={{ left: `${xy[i].x}%` }}>
            {p.year}
          </span>
        ))}
      </div>

      {/* Los mismos datos en tabla para lectores de pantalla */}
      <table className="sr-only">
        <caption>Precio de reventa por año</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.year}>
              <th scope="row">{p.year}</th>
              <td>MX${money.format(p.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
