import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '@/components/BrandMark'
import { ContainerScroll } from '@/components/ContainerScroll'
import { FlipWords } from '@/components/FlipWords'
import { HeroParallax } from '@/components/HeroParallax'
import { Button } from '@/components/ui/button'
import { useShowcasePhotos } from '@/hooks/useShowcasePhotos'

// Pagina de bienvenida (prueba): lo que ve alguien sin cuenta. Fotos reales de la comunidad que se
// enderezan al bajar, una captura de la app y la invitacion a la beta
export function WelcomePage() {
  const { data: photos = [] } = useShowcasePhotos()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between bg-background/80 px-8 py-4 backdrop-blur-md">
        <Link to="/bienvenida" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <BrandMark />
          Niche
        </Link>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/login">Entrar</Link>
        </Button>
      </header>

      <HeroParallax
        photos={photos}
        header={
          <div className="relative mx-auto w-full max-w-7xl px-8 py-20 md:py-32">
            <h1 className="text-6xl font-bold tracking-tight text-balance md:text-8xl">
              Tu <FlipWords words={['closet', 'estilo', 'lookbook', 'tienda']} />
              <br />
              en un solo lugar
            </h1>
            <p className="mt-8 max-w-2xl text-xl text-pretty text-muted-foreground">
              Guarda cada prenda con foto, arma outfits en un toque, comparte tus fits y vende lo que ya no usas.
            </p>
            <div className="mt-10 flex gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link to="/login">
                  Unirme a la beta
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        }
      />

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

      <section className="flex flex-col items-center gap-6 px-8 pb-40 text-center">
        <BrandMark className="size-16" />
        <h2 className="text-5xl font-bold tracking-tight">Beta abierta</h2>
        <p className="max-w-xl text-lg text-muted-foreground">Gratis mientras dure la beta. Tu opinion decide lo que sigue.</p>
        <Button asChild size="lg" className="rounded-full px-6">
          <Link to="/login">Crear mi cuenta</Link>
        </Button>
      </section>
    </div>
  )
}
