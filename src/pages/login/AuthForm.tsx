import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { PasswordInput } from './PasswordInput'

type Mode = 'login' | 'register'
type Errors = Partial<Record<'username' | 'email' | 'password' | 'confirm', string>>

const MODES: { value: Mode; label: string }[] = [
  { value: 'login', label: 'Iniciar sesion' },
  { value: 'register', label: 'Crear cuenta' },
]

const spring = { type: 'spring', visualDuration: 0.25, bounce: 0 } as const

function validate(mode: Mode, data: FormData): Errors {
  const value = (name: string) => String(data.get(name) ?? '').trim()
  const errors: Errors = {}
  if (mode === 'register' && !/^[a-z0-9_.]{3,20}$/i.test(value('username'))) {
    errors.username = 'De 3 a 20 letras, numeros, punto o guion bajo'
  }
  if (!/^\S+@\S+\.\S+$/.test(value('email'))) errors.email = 'Correo no valido'
  const password = String(data.get('password') ?? '')
  if (mode === 'login' && !password) errors.password = 'Escribe tu contrasena'
  if (mode === 'register' && password.length < 8) errors.password = 'Minimo 8 caracteres'
  if (mode === 'register' && data.get('confirm') !== password) errors.confirm = 'Las contrasenas no coinciden'
  return errors
}

// Formulario para entrar o crear cuenta; los campos que cambian entran y salen deslizandose
export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [errors, setErrors] = useState<Errors>({})
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  function changeMode(next: Mode) {
    setMode(next)
    setErrors({})
    setNotice('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(mode, new FormData(event.currentTarget))
    setErrors(found)
    // ponytail: aun no hay cuentas reales; con Supabase aqui se inicia sesion o se registra
    if (Object.keys(found).length === 0) navigate('/closet')
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === 'login' ? 'Entra para ver tu closet' : 'Empieza a armar tu closet digital'}
        </p>
      </div>

      {/* Selector: el fondo se desliza a la opcion elegida */}
      <div role="tablist" aria-label="Tipo de acceso" className="grid grid-cols-2 rounded-lg bg-muted p-1">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => changeMode(value)}
            className={cn(
              'relative h-9 rounded-md text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              mode === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {mode === value && (
              <motion.span
                layoutId="auth-mode-indicator"
                transition={spring}
                className="absolute inset-0 rounded-md bg-background shadow-sm"
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <form noValidate onSubmit={submit} className="flex flex-col">
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <Collapsible key="username">
              <Field id="username" label="Usuario" error={errors.username}>
                <Input id="username" name="username" autoComplete="username" className="h-11" aria-invalid={!!errors.username} />
              </Field>
            </Collapsible>
          )}
        </AnimatePresence>

        <Field id="email" label="Correo" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-11" aria-invalid={!!errors.email} />
        </Field>

        <Field
          id="password"
          label="Contrasena"
          error={errors.password}
          action={
            mode === 'login' && (
              <button
                type="button"
                onClick={() => setNotice('Podras recuperar tu contrasena cuando conectemos las cuentas.')}
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Olvidaste tu contrasena?
              </button>
            )
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-invalid={!!errors.password}
          />
        </Field>

        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <Collapsible key="confirm">
              <Field id="confirm" label="Confirmar contrasena" error={errors.confirm}>
                <PasswordInput id="confirm" name="confirm" autoComplete="new-password" aria-invalid={!!errors.confirm} />
              </Field>
            </Collapsible>
          )}
        </AnimatePresence>

        {notice && <p className="pb-4 text-sm text-muted-foreground">{notice}</p>}

        <Button type="submit" className="h-11 w-full">
          {mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
        </Button>
      </form>
    </div>
  )
}

// Campo que se abre y se cierra a lo alto al cambiar de modo
function Collapsible({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={spring}
      // Sin esto el anillo de enfoque se corta mientras se anima
      className="-mx-1 overflow-hidden px-1"
    >
      {children}
    </motion.div>
  )
}

type FieldProps = { id: string; label: string; error?: string; action?: ReactNode; children: ReactNode }

function Field({ id, label, error, action, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2 pt-1 pb-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
