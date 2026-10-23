import { Eye, EyeOff } from 'lucide-react'
import { type ComponentProps, useState } from 'react'
import { Input } from '@/components/ui/input'

// Campo de contrasena con un boton para verla o esconderla
export function PasswordInput(props: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="h-11 pr-11" />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Esconder contrasena' : 'Mostrar contrasena'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-4" />
      </button>
    </div>
  )
}
