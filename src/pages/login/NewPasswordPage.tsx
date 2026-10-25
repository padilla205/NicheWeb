import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSession, useUpdatePassword } from '@/hooks/useAuth'
import { PasswordInput } from './PasswordInput'

// La abre el link del correo "Olvidaste tu contrasena?". Supabase lee el link y deja la sesion
// iniciada; aqui solo se escribe la contrasena nueva
export function NewPasswordPage() {
  const session = useSession()
  const navigate = useNavigate()
  const updatePassword = useUpdatePassword()
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    if (password.length < 8) return setError('Minimo 8 caracteres')
    if (data.get('confirm') !== password) return setError('Las contrasenas no coinciden')
    setError('')
    try {
      await updatePassword.mutateAsync(password)
      navigate('/closet', { replace: true })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Algo salio mal, intenta de nuevo')
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nueva contrasena</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session === null
              ? 'Este link ya vencio o ya se uso. Pide otro desde la pantalla para entrar.'
              : 'Escribe la contrasena que usaras desde ahora.'}
          </p>
        </div>

        {session === undefined ? (
          <div aria-hidden className="flex flex-col gap-4">
            <div className="h-11 animate-pulse rounded-md bg-muted" />
            <div className="h-11 animate-pulse rounded-md bg-muted" />
          </div>
        ) : session === null ? (
          <Button asChild className="h-11">
            <Link to="/login">Ir a iniciar sesion</Link>
          </Button>
        ) : (
          <form noValidate onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contrasena nueva</Label>
              <PasswordInput id="password" name="password" autoComplete="new-password" autoFocus />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Confirmar contrasena</Label>
              <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={updatePassword.isPending} className="h-11">
              {updatePassword.isPending ? 'Un momento' : 'Guardar y entrar'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
