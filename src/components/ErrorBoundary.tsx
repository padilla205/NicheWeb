import { RotateCw } from 'lucide-react'
import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DemonBearIllustration } from '@/pages/not-found/DemonBearIllustration'

type ErrorBoundaryState = { failed: boolean }

// Si una pantalla falla al dibujarse, en lugar de quedarse en blanco se ve esto. React solo deja
// atrapar esos errores con un componente de clase
export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Niche: algo salio mal', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    // Esta pantalla vive fuera del router, por eso los botones recargan en lugar de navegar.
    // Recargar tambien arregla el caso de una version vieja de la app despues de publicar una nueva
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-4 text-center text-foreground">
        <DemonBearIllustration className="w-40" />
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Algo salio mal</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            No es tu culpa. Vuelve a intentarlo y, si sigue pasando, regresa al inicio.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" asChild>
            <a href="/">Ir al inicio</a>
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RotateCw />
            Reintentar
          </Button>
        </div>
      </main>
    )
  }
}
