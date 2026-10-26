import { cn } from '@/lib/utils'

export function PageTitle({ title, className }: { title: string; className?: string }) {
  return <h1 className={cn('mb-6 text-2xl font-semibold tracking-tight', className)}>{title}</h1>
}
