import { ArrowLeft, Check, Info, Sparkles, Tag } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { StepsLoader } from '@/components/StepsLoader'
import { Button } from '@/components/ui/button'
import { useModalBehavior } from '@/hooks/useModalBehavior'
import { useObjectUrls } from '@/hooks/useObjectUrls'
import { getTypeInfo } from '@/lib/clothing'
import { type GarmentScan, scanGarment } from '@/lib/garmentScan'
import { cn } from '@/lib/utils'
import { PriceReveal } from './PriceReveal'

type ScanResultProps = {
  photos: File[]
  // "Usar estos datos": llena el formulario de la prenda
  onUse: (scan: GarmentScan) => void
  onClose: () => void
}

const steps = ['Analizando la prenda', 'Leyendo la etiqueta', 'Buscando el modelo', 'Calculando el precio']

// Pantalla completa con lo que la IA encontro: modelo, descripcion, marca, año, estilo, rareza, lo de
// la etiqueta y, en una barra abajo, el precio aproximado de reventa
export function ScanResult({ photos, onUse, onClose }: ScanResultProps) {
  const [scan, setScan] = useState<GarmentScan | null>(null)
  const [failed, setFailed] = useState(false)
  const [step, setStep] = useState(0)
  useModalBehavior(onClose)
  const loading = !scan && !failed
  const reduceMotion = useReducedMotion()
  // Resorte suave para que las fotos suban del centro a su lugar; sin movimiento si el sistema lo pide
  const move = reduceMotion ? { duration: 0 } : ({ type: 'spring', visualDuration: 0.5, bounce: 0.15 } as const)

  useEffect(() => {
    let cancelled = false
    scanGarment(photos).then(
      (result) => !cancelled && setScan(result),
      () => !cancelled && setFailed(true),
    )
    // Los pasos avanzan solos mientras espera (la respuesta llega toda junta)
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 700)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [photos])

  const urlOf = useObjectUrls(photos)
  const urls = photos.map(urlOf)

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Resultado del escaneo" className="fixed inset-0 z-[60] flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <Button type="button" variant="outline" size="icon" className="rounded-xl" aria-label="Regresar" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="text-lg font-semibold tracking-tight">Resultado</h2>
        {scan?.example && <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Datos de ejemplo</span>}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Mientras carga, todo va centrado en la pantalla; con el resultado, arriba */}
        <div className={cn('mx-auto flex max-w-lg flex-col gap-5 px-4 pt-4 pb-40', loading && 'min-h-full justify-center pb-24')}>
          {/* Las fotos que se escanearon. Cargando: grandes, en abanico y al centro, con una luz que
              las recorre. Al llegar el resultado suben a su lugar arriba (layout anima el cambio) */}
          <motion.div
            layout
            transition={move}
            className={cn('flex', loading ? 'justify-center py-4' : '-mx-4 gap-2 overflow-x-auto px-4')}
          >
            {urls.map((url, i) => (
              <motion.div
                key={url}
                layout
                transition={move}
                animate={{ rotate: loading ? (i - (urls.length - 1) / 2) * 7 : 0 }}
                className={cn(
                  'relative shrink-0 overflow-hidden rounded-2xl',
                  loading ? 'h-56 w-44 shadow-[0_24px_40px_-20px_rgb(0_0_0/0.5)]' : 'h-40 w-32 shadow-md ring-1 ring-foreground/10',
                  loading && i > 0 && '-ml-28',
                )}
                // La portada queda encima de las demas en el abanico
                style={{ zIndex: urls.length - i }}
              >
                <img src={url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                {loading && i === 0 && !reduceMotion && (
                  <motion.span
                    aria-hidden
                    initial={{ y: 0 }}
                    animate={{ y: [0, 220, 0] }}
                    transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
                    className="absolute inset-x-0 top-0 h-1 bg-white shadow-[0_0_24px_8px_rgb(255_255_255/0.9)]"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {failed ? (
            <p role="alert" className="text-sm text-destructive">
              No se pudo identificar la prenda. Revisa tu conexion e intenta de nuevo, o llena los datos a mano.
            </p>
          ) : !scan ? (
            <motion.div layout transition={move} className="mx-auto flex flex-col gap-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4" />
                Identificando tu prenda
              </p>
              <StepsLoader steps={steps} current={step} />
            </motion.div>
          ) : (
            <Details scan={scan} />
          )}
        </div>
      </div>

      {/* Abajo, siempre a la mano: usar los datos en el formulario */}
      {scan && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }}
          // Franja con el fondo de la pantalla: el texto que pasa por debajo no se encima con el boton
          className="fixed inset-x-0 bottom-0 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md"
        >
          <Button type="button" size="lg" className="mx-auto flex w-full max-w-lg rounded-full" onClick={() => onUse(scan)}>
            <Check />
            Usar datos
          </Button>
        </motion.div>
      )}
    </div>,
    document.body,
  )
}

const confidenceText = { alta: 'Seguro', media: 'Probable', baja: 'Poco seguro' } as const

function Details({ scan }: { scan: GarmentScan }) {
  const facts = [
    { label: 'Marca', value: scan.brand },
    { label: 'Año', value: scan.year ? String(scan.year) : `${scan.decade}s` },
    { label: 'Tipo', value: getTypeInfo(scan.type).label },
    { label: 'Estilo', value: scan.style },
    { label: 'Rareza', value: scan.rarity },
    // Lo que se leyo en la etiqueta, solo si se pudo leer
    { label: 'Talla', value: scan.tag.size },
    { label: 'Material', value: scan.tag.material },
    { label: 'Hecho en', value: scan.tag.madeIn },
  ].filter((fact) => fact.value)
  return (
    // Entra un momento despues, cuando las fotos ya subieron
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.3 }} className="flex flex-col gap-5">
      {/* Tarjeta del modelo: que es la prenda y que tan segura esta la IA */}
      <section className="rounded-3xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Sparkles className="size-3.5" />
            Modelo identificado
          </p>
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium',
              scan.confidence === 'baja' ? 'bg-muted text-muted-foreground' : 'border-foreground bg-foreground text-background',
            )}
          >
            {confidenceText[scan.confidence]}
          </span>
        </div>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-balance">{scan.model}</h3>
        <p className="mt-2 text-pretty text-muted-foreground">{scan.description}</p>
      </section>

      {/* Lo mejor del resultado, justo despues de la descripcion: cuanto vale */}
      <PriceReveal price={scan.price} />

      {/* Ficha: tarjeta con titulo y renglones separados por una linea fina */}
      <section aria-labelledby="ficha-titulo" className="rounded-3xl border bg-card px-5 pt-4 pb-2 shadow-sm">
        <h4 id="ficha-titulo" className="flex items-center gap-1.5 border-b pb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <Tag className="size-3.5" />
          Ficha de la prenda
        </h4>
        <dl className="divide-y">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="text-right font-medium text-pretty">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="flex items-start gap-2 rounded-2xl border border-dashed p-3.5 text-xs text-pretty text-muted-foreground">
        <Info className="mt-px size-4 shrink-0" />
        Revisa los datos: la IA puede equivocarse. Al usarlos los puedes corregir en el formulario.
      </p>
    </motion.div>
  )
}
