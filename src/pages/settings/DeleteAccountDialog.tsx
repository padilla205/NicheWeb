import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteAccount } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

// Borrar la cuenta no se puede deshacer: se pide escribir tu usuario para confirmar
export function DeleteAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { username } = useProfile()
  const [typed, setTyped] = useState('')
  const deleteAccount = useDeleteAccount()
  const confirmed = typed.trim().replace(/^@/, '').toLowerCase() === username.toLowerCase()

  function close() {
    if (deleteAccount.isPending) return
    setTyped('')
    deleteAccount.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Borrar tu cuenta</DialogTitle>
          <DialogDescription>Esto no se puede deshacer. Se borra para siempre:</DialogDescription>
        </DialogHeader>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
          <li>Tu perfil, tus fotos y tu closet completo</li>
          <li>Tus outfits, publicaciones, comentarios y likes</li>
          <li>Tus ventas, ventas guardadas y chats</li>
          <li>Tus seguidores, a quienes sigues y tus notificaciones</li>
        </ul>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-username" className="block leading-snug">
            Escribe tu usuario <span className="font-semibold">@{username}</span> para confirmar
          </Label>
          <Input
            id="confirm-username"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            disabled={deleteAccount.isPending}
          />
        </div>
        {deleteAccount.isError && (
          <p role="alert" className="text-sm text-destructive">
            No se pudo borrar la cuenta. Revisa tu conexion e intenta de nuevo.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={deleteAccount.isPending}>
            Cancelar
          </Button>
          {/* Al terminar se cierra la sesion y RequireAuth te lleva a la pantalla de entrar */}
          <Button
            variant="destructive"
            disabled={!confirmed || deleteAccount.isPending}
            onClick={() => deleteAccount.mutate()}
          >
            {deleteAccount.isPending ? 'Borrando...' : 'Borrar mi cuenta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
