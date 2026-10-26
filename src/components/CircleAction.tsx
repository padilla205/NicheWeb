import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type CircleActionProps = ComponentProps<'button'> & {
  icon: LucideIcon
  label: string
  // Numero chico en la esquina (por ejemplo, filtros activos)
  badge?: number
}

// Accion rapida sobre fondo negro: circulo grafito con el icono y el nombre abajo, como los atajos
// de las apps de banco. Se usa en la cabecera negra del celular
export function CircleAction({ icon: Icon, label, badge, className, ...props }: CircleActionProps) {
  return (
    <button
      type="button"
      className={cn('group flex w-16 flex-col items-center gap-1.5 text-xs text-white/75 outline-none select-none', className)}
      {...props}
    >
      <span className="relative flex size-14 items-center justify-center rounded-full bg-[#1C1C1C] text-white ring-1 ring-white/10 transition-transform duration-150 group-focus-visible:ring-2 group-focus-visible:ring-white/60 motion-safe:group-active:scale-95">
        <Icon className="size-5" />
        {badge ? (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-black tabular-nums">
            {badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  )
}
