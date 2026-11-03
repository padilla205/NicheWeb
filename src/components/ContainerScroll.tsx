import { motion, useScroll, useTransform } from 'motion/react'
import { type ReactNode, useRef } from 'react'

// Pantalla que viene inclinada hacia atras y se endereza mientras bajas, con el titulo arriba
// (adaptado de Container Scroll Animation de Aceternity UI)
export function ContainerScroll({ title, children }: { title: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref })
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1])
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div ref={ref} className="relative flex h-[80rem] items-center justify-center p-20">
      <div className="relative w-full py-40" style={{ perspective: '1000px' }}>
        <motion.div style={{ translateY }} className="mx-auto max-w-5xl text-center">
          {title}
        </motion.div>
        <motion.div
          style={{ rotateX, scale }}
          className="mx-auto -mt-12 h-[40rem] w-full max-w-5xl rounded-[30px] border-4 border-neutral-600 bg-neutral-900 p-6 shadow-[0_9px_20px_#0000004a,0_37px_37px_#00000042,0_84px_50px_#00000026]"
        >
          <div className="size-full overflow-hidden rounded-2xl bg-background">{children}</div>
        </motion.div>
      </div>
    </div>
  )
}
