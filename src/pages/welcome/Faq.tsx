import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'

// Dudas que alguien tiene antes de crear su cuenta. Cada pregunta se abre y se cierra con un toque,
// y la respuesta baja suave
const questions = [
  {
    q: '¿Niche es gratis?',
    a: 'Si. Durante la beta todo es gratis: tu closet, el generador de outfits, el feed y el marketplace.',
  },
  {
    q: '¿Como se paga cuando compro o vendo una prenda?',
    a: 'Niche no cobra ni procesa pagos: comprador y vendedor se ponen de acuerdo por chat y cierran el trato en persona. Antes de verte con alguien, revisa los consejos de seguridad de cada venta.',
  },
  {
    q: '¿Mi closet y mis fotos son privados?',
    a: 'Tu decides. Tu closet puede ser publico o privado, y cada prenda se puede ocultar. Lo que publicas en el feed y tus ventas si son visibles para todos.',
  },
  {
    q: '¿Tengo que descargar una app?',
    a: 'No. Niche funciona desde el navegador de tu celular o tu computadora. En el celular puedes agregarla a tu pantalla de inicio para abrirla como una app.',
  },
  {
    q: '¿Como quito el fondo de mis fotos?',
    a: 'Al subir una prenda toca Editar y luego Quitar fondo. Se hace en tu propio dispositivo: tu foto no se manda a ningun servidor para eso.',
  },
  {
    q: '¿Que hago si alguien me molesta o publica algo inapropiado?',
    a: 'Puedes reportar o bloquear a cualquier usuario. Las publicaciones con varios reportes se ocultan mientras se revisan.',
  },
]

export function Faq() {
  return (
    <Reveal as="section" className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-24 md:px-8">
      <div className="text-center">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Preguntas frecuentes</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">¿Tienes dudas?</h2>
      </div>
      <div className="flex flex-col gap-3">
        {questions.map(({ q, a }) => (
          <FaqItem key={q} question={q} answer={a} />
        ))}
      </div>
    </Reveal>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="rounded-3xl border bg-card px-6">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium outline-none focus-visible:underline"
      >
        {question}
        {/* El + gira y se vuelve x al abrir */}
        <Plus className={cn('size-5 shrink-0 transition-transform duration-200', open && 'rotate-45')} />
      </button>
      {/* La respuesta crece hacia abajo y el texto baja un poco mientras aparece */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', visualDuration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0 }}
              className="pb-5 text-pretty text-muted-foreground"
            >
              {answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
