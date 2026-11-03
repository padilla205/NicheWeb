import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '@/components/BrandMark'
import { ContainerScroll } from '@/components/ContainerScroll'
import { FlipWords } from '@/components/FlipWords'
import { HeroParallax } from '@/components/HeroParallax'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useShowcasePhotos } from '@/hooks/useShowcasePhotos'
import { Faq } from './Faq'
import { PhotoMarquee } from './PhotoMarquee'
import { Features } from './Features'
import { WelcomeFooter } from './WelcomeFooter'
import { WelcomeHeader } from './WelcomeHeader'

// Pagina de bienvenida (prueba): lo que ve alguien sin cuenta. Fotos reales de la comunidad que se
// enderezan al bajar, una captura de la app y la invitacion a la beta
export function WelcomePage() {
  const { data: photos = [] } = useShowcasePhotos()
  // Computadora: mosaico 3D que se endereza al bajar. Celular: tiras de fotos que se deslizan solas
  const wide = useMediaQuery('(min-width: 768px)')
  const intro = (
    <div className="relative mx-auto w-full max-w-7xl px-6 py-12 md:px-8 md:py-32">
      <h1 className="text-5xl font-bold tracking-tight text-balance md:text-8xl">
        Tu <FlipWords words={['closet', 'estilo', 'lookbook', 'tienda']} />
        <br />
        en un solo lugar
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground md:mt-8 md:text-xl">
        Guarda cada prenda con foto, arma outfits en un toque, comparte tus fits y vende lo que ya no usas.
      </p>
      <div className="mt-8 flex gap-3 md:mt-10">
        <Button asChild size="lg" className="rounded-full px-6">
          <Link to="/login">
            Unirme a la beta
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <WelcomeHeader />

      {wide ? (
        <HeroParallax photos={photos} header={intro} />
      ) : (
        <div className="pt-16">
          {intro}
          <PhotoMarquee photos={photos} />
        </div>
      )}

      <Features />

      <ContainerScroll
        title={
          <h2 className="mb-16 text-5xl font-bold tracking-tight text-balance">
            Todo tu closet,
            <br />
            <span className="text-7xl">a la mano</span>
          </h2>
        }
      >
        <img src="/landing/app-escritorio.webp" alt="El closet de Niche en la computadora" className="size-full object-cover object-left-top" />
      </ContainerScroll>

      <Faq />

      <section className="flex flex-col items-center gap-6 px-8 pb-28 text-center">
        <BrandMark className="size-16" />
        <h2 className="text-5xl font-bold tracking-tight">Beta abierta</h2>
        <p className="max-w-xl text-lg text-muted-foreground">Gratis mientras dure la beta. Tu opinion decide lo que sigue.</p>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link to="/login">Crear mi cuenta</Link>
        </Button>
      </section>

      <WelcomeFooter />
    </div>
  )
}
