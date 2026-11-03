import { Check, LoaderCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

export type ButtonState = 'idle' | 'loading' | 'success'

// Boton que muestra lo que esta pasando: un circulo girando mientras trabaja y una palomita al
// terminar; el icono entra y sale encogiendose (adaptado de Stateful Button de Aceternity UI)
export function StatefulButton({ state, children, ...props }: ComponentProps<typeof Button> & { state: ButtonState }) {
  return (
    <Button {...props} disabled={props.disabled || state !== 'idle'} aria-busy={state === 'loading'}>
      <AnimatePresence mode="popLayout" initial={false}>
        {state !== 'idle' && (
          <motion.span
            key={state}
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: 'auto' }}
            exit={{ scale: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {state === 'loading' ? <LoaderCircle className="animate-spin" /> : <Check />}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span layout>{children}</motion.span>
    </Button>
  )
}
