import { cn } from '@/lib/utils'

export function PageTitle({ title, className }: { title: string; className?: string }) {
  return <h1 className={cn('mb-6 text-[28px] font-semibold tracking-tight md:text-2xl', className)}>{title}</h1>
}
