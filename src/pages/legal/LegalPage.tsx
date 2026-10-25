import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'

// Correo para dudas, solicitudes sobre tus datos y reportes que no se puedan hacer en la app
export const CONTACT_EMAIL = 'archivomexicano507@gmail.com'

// Forma comun del aviso de privacidad y los terminos: titulo, fecha y secciones. Se leen sin cuenta
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6 pb-10 text-sm leading-relaxed">
      <Button variant="ghost" size="sm" className="-mb-2 -ml-2 self-start" onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </Button>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">Ultima actualizacion: {updated}</p>
      </header>
      {children}
    </article>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1 pl-5">{children}</ul>
}

export function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
      {CONTACT_EMAIL}
    </a>
  )
}
