import { Backpack, Footprints, Gem, Glasses, type LucideIcon, Shirt, ShoppingBag, Tag, Watch } from 'lucide-react'
import type { CSSProperties } from 'react'

// Dos anillos de tarjetas de prendas (como las del closet) girando en 3D detras de la pantalla de
// entrar, desenfocadas y tenues. Es CSS 3D: lo mueve la tarjeta grafica y no gasta casi bateria
const RINGS: { icons: LucideIcon[]; radius: number; y: number; reverse: boolean }[] = [
  { icons: [Shirt, Watch, Footprints, Gem, ShoppingBag, Glasses, Tag, Backpack], radius: 520, y: -150, reverse: false },
  { icons: [Footprints, Shirt, Tag, Glasses, Backpack, Watch, Gem, ShoppingBag], radius: 440, y: 170, reverse: true },
]

export function ClosetOrbit() {
  return (
    // El desenfoque va en esta capa de afuera: puesto en la capa 3D la aplanaria
    <div aria-hidden="true" className="closet-orbit-fade pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-50 blur-[3px] max-md:opacity-30 dark:opacity-40 max-md:dark:opacity-25">
      {/* En celular los anillos son mas chicos para no quedar enormes detras del formulario */}
      <div className="absolute inset-0 flex items-center justify-center [perspective:1100px] max-md:scale-[0.6]">
        <div className="[transform-style:preserve-3d] [transform:rotateX(-10deg)]">
          {RINGS.map(({ icons, radius, y, reverse }, ring) => (
            <div
              key={ring}
              className="closet-orbit-ring absolute [transform-style:preserve-3d]"
              style={{ top: y, animationDirection: reverse ? 'reverse' : 'normal' } as CSSProperties}
            >
              {icons.map((Icon, index) => (
                <div
                  key={index}
                  className="absolute -top-[75px] -left-[60px] flex h-[150px] w-[120px] items-center justify-center rounded-2xl border bg-card shadow-sm"
                  style={{ transform: `rotateY(${(360 / icons.length) * index}deg) translateZ(${radius}px)` }}
                >
                  <Icon className="size-12 text-muted-foreground" strokeWidth={1.25} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
