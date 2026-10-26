import { Plus, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router'
import { CircleAction } from '@/components/CircleAction'
import { useProfile } from '@/hooks/useProfile'
import type { ClosetFilterValue } from '@/lib/clothing'
import { mobileHeroClass } from '@/lib/styles'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { ClosetFilters } from './ClosetFilters'
import { ClosetVisibility } from './ClosetVisibility'

type ClosetHeroProps = {
  filters: ClosetFilterValue
  onFiltersChange: (filters: ClosetFilterValue) => void
  onAdd: (button: HTMLElement) => void
}

// Cabecera negra del closet en celular: saludo y una fila de atajos en circulos. Debajo, las
// prendas van en una hoja que sube encima de ella (ver ClosetPage)
export function ClosetHero({ filters, onFiltersChange, onAdd }: ClosetHeroProps) {
  const profile = useProfile()
  const navigate = useNavigate()
  const firstName = profile.name.split(' ')[0]

  return (
    <div className={mobileHeroClass}>
      <div className="flex items-center gap-3">
        <UserAvatar user={profile} className="size-11 bg-[#1C1C1C] text-sm" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">Hola, {firstName}</h1>
          <p className="text-sm text-white/60">Tu closet</p>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <CircleAction icon={Plus} label="Agregar" onClick={(event) => onAdd(event.currentTarget)} />
        <ClosetFilters value={filters} onChange={onFiltersChange} circle />
        <ClosetVisibility circle />
        <CircleAction icon={Sparkles} label="Outfit" onClick={() => navigate('/outfits')} />
      </div>
    </div>
  )
}
