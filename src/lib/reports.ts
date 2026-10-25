import type { FeedUser } from '@/lib/feed'

export type ReportTargetType = 'post' | 'comment' | 'listing' | 'profile' | 'message'
export type ReportReason = 'inapropiado' | 'estafa' | 'acoso' | 'spam' | 'otro'

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'inapropiado', label: 'Contenido inapropiado' },
  { value: 'estafa', label: 'Estafa o fraude' },
  { value: 'acoso', label: 'Acoso u ofensas' },
  { value: 'spam', label: 'Spam' },
  { value: 'otro', label: 'Otro' },
]

export const TARGET_LABELS: Record<ReportTargetType, string> = {
  post: 'Publicacion',
  comment: 'Comentario',
  listing: 'Venta',
  profile: 'Perfil',
  message: 'Mensaje de chat',
}

// Lo que se ve de lo reportado en el panel; null si ya se borro
export type ReportTarget = { owner: FeedUser; text: string; thumbUrl?: string; link?: string }

export type ReportGroup = {
  type: ReportTargetType
  id: string
  reports: { reason: ReportReason; details: string; reporter: FeedUser; createdAt: Date }[]
  target: ReportTarget | null
}
