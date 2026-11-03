import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/lib/utils'
import { OutfitDemo } from './OutfitDemo'
import { PhoneVideo } from './PhoneVideo'

type Feature = {
  eyebrow: string
  title: string
  body: string
  points: string[]
  media: ReactNode
}

// Que hace Niche, una funcion por bloque: texto de un lado y la app moviendose del otro
const features: Feature[] = [
  {
    eyebrow: 'Closet digital',
    title: 'Toda tu ropa, siempre a la mano',
    body: 'Guarda cada prenda con su foto, tipo, color y temporada. Encuentra lo que buscas en segundos y decide que mostrar en tu perfil y que mantener solo para ti.',
    points: ['Quita el fondo de tus fotos en un toque', 'Filtra por tipo, color o temporada', 'Closet publico o privado, tu eliges'],
    media: <PhoneVideo src="/landing/closet.mp4" label="El closet de Niche: filtros y agregar prenda" />,
  },
  {
    eyebrow: 'Generador de outfits',
    title: 'Combinaciones nuevas con lo que ya tienes',
    body: 'Cuando sientes que siempre te vistes igual, Niche arma outfits con tus propias prendas: una por cada parte, segun la temporada y sin repetir combinaciones.',
    points: ['Fija las piezas que te gustan y cambia el resto', 'Respeta la temporada que elijas', 'Guarda tus favoritos y compartelos'],
    media: <OutfitDemo />,
  },
  {
    eyebrow: 'Comunidad',
    title: 'Inspirate con gente como tu',
    body: 'Comparte tus prendas mas valiosas y tus mejores outfits, descubre ideas originales de personas con tu estilo y conversa con ellas en tiempo real.',
    points: ['Likes, comentarios y mensajes al instante', 'Destacados que se renuevan cada hora', 'Sigue a quien te inspira'],
    media: <PhoneVideo src="/landing/feed.mp4" label="El feed de Niche" />,
  },
  {
    eyebrow: 'Compra y venta',
    title: 'Encuentra esa prenda o dale una segunda vida',
    body: 'Busca la prenda que siempre quisiste o vende la que solo ocupa espacio. Publica en minutos, filtra por talla, marca y precio, y acuerda la entrega por chat.',
    points: ['Publica directo desde tu closet', 'Avisos cuando algo que guardaste baja de precio', 'El trato se cierra en persona'],
    media: <PhoneVideo src="/landing/marketplace.mp4" label="El marketplace de Niche: ordenar y abrir una venta" />,
  },
]

export function Features() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-28 px-6 py-24 md:gap-40 md:px-8">
      {features.map((feature, i) => (
        <Reveal as="section" key={feature.title} className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <div className={cn('flex flex-col gap-5', i % 2 === 1 && 'md:order-2')}>
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{feature.eyebrow}</p>
            <h2 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">{feature.title}</h2>
            <p className="text-lg text-pretty text-muted-foreground">{feature.body}</p>
            <ul className="flex flex-col gap-2.5">
              {feature.points.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-3.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className={cn(i % 2 === 1 && 'md:order-1')}>{feature.media}</div>
        </Reveal>
      ))}

      {/* Lo que hace distinto a Niche y para quien es */}
      <Reveal as="section" className="flex flex-col items-center gap-6 rounded-[2.5rem] bg-neutral-950 px-8 py-20 text-center text-white md:px-20">
        <p className="text-sm font-medium tracking-wide text-white/60 uppercase">¿Por que Niche?</p>
        <h2 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">Un espacio para todos los que viven la ropa</h2>
        <p className="max-w-2xl text-lg text-pretty text-white/70">
          Niche reinventa la forma de vivir la moda: un lugar donde quien apenas empieza y quien la sigue de cerca conviven, comparten ideas y se expresan con libertad. Para quien quiere digitalizar su closet, encontrar referencias o simplemente inspirarse.
        </p>
      </Reveal>
    </div>
  )
}
