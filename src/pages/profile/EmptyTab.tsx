import type { ReactNode } from 'react'

// Mensaje cuando una pestana del perfil aun no tiene nada
export function EmptyTab({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}
