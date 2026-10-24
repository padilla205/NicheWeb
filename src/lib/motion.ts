// Entrada y salida de iconos y elementos pequenos: escala, opacidad y desenfoque con resorte sin rebote
export const popIn = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: { type: 'spring', duration: 0.3, bounce: 0 },
} as const

// Tarjetas de una cuadricula: aparecen subiendo apenas, una tras otra. El retraso se reinicia en
// cada bloque de "Ver mas" y tiene tope, asi la ultima nunca tarda mas de un tercio de segundo
export function cascade(index: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: 'easeOut', delay: Math.min(index % 12, 8) * 0.04 },
  } as const
}

// Contenido que reemplaza a otro (skeleton -> tarjetas): se desvanece rapido de uno al otro
export const crossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const

// Tarjetas que responden al mouse: suben un poco con sombra (solo con mouse; en celular no hay hover).
// Usa "translate", no "transform", para no chocar con las animaciones de Motion
export const hoverLift =
  'transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0'
