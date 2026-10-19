import { AtSign, Camera, Globe, type LucideIcon, Music2, Pin, Play, Users } from 'lucide-react'

export const BIO_MAX = 160

export type SocialPlatform = 'instagram' | 'tiktok' | 'x' | 'youtube' | 'facebook' | 'pinterest' | 'web'

export type SocialLink = {
  platform: SocialPlatform
  // Usuario de la red (sin @), o la direccion completa si es un sitio web
  handle: string
}

export type Profile = {
  name: string
  username: string
  bio: string
  avatarUrl?: string
  coverUrl?: string
  socials: SocialLink[]
  // Si los demas pueden ver tu closet en tu perfil; empieza privado
  closetPublic: boolean
}

// lucide-react no trae logos de marcas, asi que cada red usa un icono generico junto a su nombre
export const socialPlatforms: {
  value: SocialPlatform
  label: string
  icon: LucideIcon
  baseUrl: string
}[] = [
  { value: 'instagram', label: 'Instagram', icon: Camera, baseUrl: 'https://instagram.com/' },
  { value: 'tiktok', label: 'TikTok', icon: Music2, baseUrl: 'https://tiktok.com/@' },
  { value: 'x', label: 'X', icon: AtSign, baseUrl: 'https://x.com/' },
  { value: 'youtube', label: 'YouTube', icon: Play, baseUrl: 'https://youtube.com/@' },
  { value: 'facebook', label: 'Facebook', icon: Users, baseUrl: 'https://facebook.com/' },
  { value: 'pinterest', label: 'Pinterest', icon: Pin, baseUrl: 'https://pinterest.com/' },
  { value: 'web', label: 'Sitio web', icon: Globe, baseUrl: '' },
]

export function getPlatform(platform: SocialPlatform) {
  return socialPlatforms.find((option) => option.value === platform) ?? socialPlatforms[0]
}

// Direccion a la que lleva el boton; null si no es valida.
// Solo se aceptan http y https para que nadie pueda meter un link "javascript:" en su perfil.
export function getSocialUrl({ platform, handle }: SocialLink): string | null {
  const value = handle.trim()
  if (platform !== 'web') {
    const user = value.replace(/^@/, '')
    return /^[\w.-]+$/.test(user) ? getPlatform(platform).baseUrl + user : null
  }
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}

// Texto del boton: el nombre de la red, o el dominio si es un sitio web
export function getSocialLabel(link: SocialLink) {
  if (link.platform !== 'web') return getPlatform(link.platform).label
  const url = getSocialUrl(link)
  return url ? new URL(url).hostname.replace(/^www\./, '') : 'Sitio web'
}
