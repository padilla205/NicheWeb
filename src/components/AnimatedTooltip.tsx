import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { type ReactNode, useState } from 'react'

// Al pasar el mouse muestra un globito con el nombre que se inclina segun hacia donde mueves el
// mouse, con un rebote al aparecer (adaptado de Animated Tooltip de Aceternity UI)
export function AnimatedTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const x = useMotionValue(0)
  const rotate = useSpring(useTransform(x, [-20, 20], [-25, 25]), { stiffness: 100, damping: 15 })
  const translateX = useSpring(useTransform(x, [-20, 20], [-12, 12]), { stiffness: 100, damping: 15 })
  return (
    <span
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        x.set(event.clientX - box.left - box.width / 2)
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 12, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 10 } }}
            exit={{ opacity: 0, y: 12, scale: 0.6 }}
            style={{ rotate, translateX }}
            className="pointer-events-none absolute -top-10 left-1/2 z-50 -ml-12 flex w-24 justify-center"
          >
            <span className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium whitespace-nowrap text-background shadow-xl">{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </span>
  )
}
