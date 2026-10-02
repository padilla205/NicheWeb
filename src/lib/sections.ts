import {
  type LucideIcon,
  MessageCircle,
  Newspaper,
  Shirt,
  Sparkles,
  Store,
  User,
} from 'lucide-react'

export type Section = {
  path: string
  label: string
  icon: LucideIcon
}

// Secciones del menu lateral, en el orden en que se muestran
export const sections: Section[] = [
  { path: '/closet', label: 'Closet', icon: Shirt },
  { path: '/outfits', label: 'Outfits', icon: Sparkles },
  { path: '/feed', label: 'Feed', icon: Newspaper },
  { path: '/marketplace', label: 'Marketplace', icon: Store },
  { path: '/chat', label: 'Mensajes', icon: MessageCircle },
  { path: '/profile', label: 'Perfil', icon: User },
]
