import { type MotionValue, motion, useScroll, useSpring, useTransform } from 'motion/react'
import { type ReactNode, useRef } from 'react'
import { Link } from 'react-router'
import type { ShowcasePhoto } from '@/hooks/useShowcasePhotos'

// Mosaico de fotos en 3 filas: al bajar se endereza (viene inclinado en 3D) y las filas se deslizan
// en sentidos opuestos. Arriba va el encabezado (adaptado de Hero Parallax de Aceternity UI)
export function HeroParallax({ photos, header }: { photos: ShowcasePhoto[]; header: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const spring = { stiffness: 300, damping: 30 }
  const slide = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), spring)
  const slideBack = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), spring)
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), spring)
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), spring)
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), spring)
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), spring)

  // Con pocas fotos se repiten para llenar las 3 filas de 5
  const filled = photos.length ? Array.from({ length: 15 }, (_, i) => photos[i % photos.length]) : []
  const rows = [filled.slice(0, 5), filled.slice(5, 10), filled.slice(10, 15)]

  return (
    <div ref={ref} className="relative flex h-[300vh] flex-col overflow-hidden py-40 [perspective:1000px] [transform-style:preserve-3d]">
      {header}
      <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
        {rows.map((row, r) => (
          <div key={r} className={r === 1 ? 'mb-20 flex gap-20' : 'mb-20 flex flex-row-reverse gap-20'}>
            {row.map((photo, i) => (
              <PhotoCard key={`${photo.id}-${r}-${i}`} photo={photo} x={r === 1 ? slideBack : slide} />
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function PhotoCard({ photo, x }: { photo: ShowcasePhoto; x: MotionValue<number> }) {
  const content = (
    <>
      {/* Si la foto ya no existe, la tarjeta se esconde en vez de mostrar el icono de foto rota */}
      <img
        src={photo.src}
        alt={photo.title}
        loading="lazy"
        onError={(event) => event.currentTarget.closest<HTMLElement>('.photo-card')?.style.setProperty('display', 'none')}
        className="absolute inset-0 size-full rounded-3xl object-cover"
      />
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-70" />
      <h2 className="absolute bottom-5 left-5 text-lg font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">{photo.title}</h2>
    </>
  )
  return (
    <motion.div style={{ x }} whileHover={{ y: -20 }} className="photo-card group relative h-96 w-[30rem] shrink-0">
      {photo.link ? (
        <Link to={photo.link} className="block size-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  )
}
