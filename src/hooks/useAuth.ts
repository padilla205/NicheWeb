import type { AuthError, Session } from '@supabase/supabase-js'
import { useMutation } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'

// undefined: todavia se esta leyendo la sesion guardada; null: no hay sesion
let session: Session | null | undefined
const listeners = new Set<() => void>()

// Supabase avisa al cargar (con la sesion guardada en el navegador), al entrar y al salir
supabase.auth.onAuthStateChange((_event, next) => {
  session = next
  listeners.forEach((listener) => listener())
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSession() {
  return useSyncExternalStore(subscribe, () => session)
}

// Mensajes de Supabase traducidos para mostrarlos en el formulario
const messages: Record<string, string> = {
  invalid_credentials: 'Correo o contrasena incorrectos',
  user_already_exists: 'Ya hay una cuenta con ese correo',
  email_exists: 'Ya hay una cuenta con ese correo',
  weak_password: 'La contrasena es muy debil',
  email_address_invalid: 'Correo no valido',
  over_request_rate_limit: 'Demasiados intentos, espera un momento',
  over_email_send_rate_limit: 'Demasiados intentos, espera un momento',
  same_password: 'La nueva contrasena debe ser distinta a la anterior',
}

function friendly(error: AuthError) {
  return new Error((error.code && messages[error.code]) || 'Algo salio mal, intenta de nuevo')
}

type Credentials = { email: string; password: string }

export function useSignIn() {
  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw friendly(error)
    },
  })
}

export class UsernameTakenError extends Error {}

export function useSignUp() {
  return useMutation({
    mutationFn: async ({ email, password, username }: Credentials & { username: string }) => {
      // Se revisa antes porque si el usuario ya existe Supabase solo devuelve un error generico
      const { count, error: lookupError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('username', username)
      if (lookupError) throw new Error('Algo salio mal, intenta de nuevo')
      if (count) throw new UsernameTakenError('Ese usuario ya esta ocupado')

      // El trigger de la base de datos crea el perfil con estos datos
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, name: username } },
      })
      if (error) throw friendly(error)
      // Sin sesion significa que Supabase pide confirmar el correo antes de entrar
      return { needsConfirmation: !data.session }
    },
  })
}

// Manda el correo con el link para cambiar la contrasena; el link abre /nueva-contrasena
export function useSendPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nueva-contrasena`,
      })
      if (error) throw friendly(error)
    },
  })
}

// Cambia la contrasena de quien tiene la sesion (la que abre el link del correo)
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw friendly(error)
    },
  })
}

// Borra tu cuenta para siempre: primero tus fotos (Storage solo deja borrar tu carpeta) y luego la
// cuenta, que se lleva en cadena todo lo demas. Al final se cierra la sesion en este navegador
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const userId = session?.user.id
      if (!userId) throw new Error('No hay sesion')
      // Storage entrega las fotos de 100 en 100
      for (;;) {
        const { data: files, error } = await supabase.storage.from('photos').list(userId, { limit: 100 })
        if (error) throw error
        if (files.length === 0) break
        const { data: removed, error: removeError } = await supabase.storage
          .from('photos')
          .remove(files.map((file) => `${userId}/${file.name}`))
        if (removeError) throw removeError
        // Si no se pudo borrar ninguna, se detiene en vez de intentarlo para siempre
        if (removed.length === 0) throw new Error('No se pudieron borrar las fotos')
      }
      const { error } = await supabase.rpc('delete_my_account')
      if (error) throw error
      await supabase.auth.signOut({ scope: 'local' })
    },
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw friendly(error)
    },
  })
}
