import { AnimatePresence, motion } from 'motion/react'
import { type FormEvent, type ReactNode, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UsernameTakenError, useSendPasswordReset, useSignIn, useSignUp } from '@/hooks/useAuth'
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
  // Error que devuelve Supabase (contrasena incorrecta, correo ya usado...)
  const [formError, setFormError] = useState('')
  const signIn = useSignIn()
  const signUp = useSignUp()
  const sendReset = useSendPasswordReset()
  const pending = signIn.isPending || signUp.isPending
  const formRef = useRef<HTMLFormElement>(null)

  // Usa el correo que ya escribiste para mandar el link de recuperacion
  async function forgotPassword() {
    const email = String(new FormData(formRef.current!).get('email') ?? '').trim()
    setFormError('')
    setNotice('')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Escribe tu correo para recuperar tu contrasena' })
      return
    }
    setErrors({})
    try {
      await sendReset.mutateAsync(email)
      // Mismo aviso exista o no la cuenta, para no revelar que correos estan registrados
      setNotice('Si hay una cuenta con ese correo, te enviamos un link para cambiar tu contrasena.')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Algo salio mal, intenta de nuevo')
    }
  }

  function changeMode(next: Mode) {
    setMode(next)
    setErrors({})
    setNotice('')
    setFormError('')
  }

  // Al entrar, LoginPage ve la sesion nueva y te lleva al closet
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const found = validate(mode, data)
    setErrors(found)
    setFormError('')
    setNotice('')
    if (Object.keys(found).length > 0) return

    const email = String(data.get('email')).trim()
    const password = String(data.get('password'))
    try {
      if (mode === 'login') {
        await signIn.mutateAsync({ email, password })
        return
      }
      const username = String(data.get('username')).trim().toLowerCase()
      const { needsConfirmation } = await signUp.mutateAsync({ email, password, username })
      if (needsConfirmation) setNotice('Te enviamos un correo para confirmar tu cuenta.')
    } catch (error) {
      if (error instanceof UsernameTakenError) setErrors({ username: error.message })
      else setFormError(error instanceof Error ? error.message : 'Algo salio mal, intenta de nuevo')
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {/* Al cambiar de modo el texto nuevo se abre desde el centro hacia los lados, como cortina */}
      {/* popLayout: el texto que sale no ocupa lugar, asi nada brinca. Tambien se abre al cargar la pagina */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mode}
          initial={{ clipPath: 'inset(0 50% 0 50%)' }}
          animate={{ clipPath: 'inset(0 0% 0 0%)' }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className="shine-text text-2xl font-semibold tracking-tight [--shine-base:var(--foreground)]">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="shine-text mt-1 text-sm [--shine-base:var(--muted-foreground)]">
            {mode === 'login' ? 'Entra para ver tu closet' : 'Empieza a armar tu closet digital'}
          </p>
        </motion.div>
      </AnimatePresence>

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

      <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col">
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
                onClick={forgotPassword}
                disabled={sendReset.isPending}
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
        {formError && (
          <p role="alert" className="pb-4 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-11 w-full">
          {pending ? 'Un momento' : mode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
        </Button>
        {mode === 'register' && (
          <p className="pt-3 text-center text-xs text-muted-foreground">
            Al crear tu cuenta aceptas los{' '}
            <Link to="/terminos" className="underline underline-offset-4 hover:text-foreground">
              Terminos de uso
            </Link>{' '}
            y el{' '}
            <Link to="/privacidad" className="underline underline-offset-4 hover:text-foreground">
              Aviso de privacidad
            </Link>
            .
          </p>
        )}
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
