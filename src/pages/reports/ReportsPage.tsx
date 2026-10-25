import { ExternalLink, ShieldCheck, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { useDeleteReported, useIsAdmin, useOpenReports, useResolveReports } from '@/hooks/useReports'
import { formatTimeAgo } from '@/lib/feed'
import { REPORT_REASONS, type ReportGroup, TARGET_LABELS } from '@/lib/reports'
import { UserAvatar } from '@/pages/feed/UserAvatar'
import { EmptyTab } from '@/pages/profile/EmptyTab'

const reasonLabel = Object.fromEntries(REPORT_REASONS.map(({ value, label }) => [value, label]))

// Panel de admin: lo reportado, agrupado, con lo que dijo cada quien. Descartar o borrar
export function ReportsPage() {
  const isAdmin = useIsAdmin()
  const { data: groups, isPending } = useOpenReports(isAdmin)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageTitle title="Reportes" />
      {!isAdmin ? (
        <EmptyTab>Esta seccion es solo para administradores.</EmptyTab>
      ) : isPending ? (
        <div aria-hidden className="flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : groups?.length === 0 ? (
        <EmptyTab>No hay reportes pendientes.</EmptyTab>
      ) : (
        <ul className="flex flex-col gap-3">
          {groups?.map((group) => (
            <li key={`${group.type}:${group.id}`}>
              <ReportCard group={group} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ReportCard({ group }: { group: ReportGroup }) {
  const resolve = useResolveReports()
  const remove = useDeleteReported()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { target } = group
  const count = group.reports.length
  const deletable = group.type === 'post' || group.type === 'comment' || group.type === 'listing'
  const busy = resolve.isPending || remove.isPending

  return (
    <article className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <header className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{TARGET_LABELS[group.type]}</span>
        <span className="font-medium tabular-nums">
          {count} {count === 1 ? 'reporte' : 'reportes'}
        </span>
        {/* Con 3 reportes la base de datos ya lo oculto a todos menos a su autor y a admin */}
        {count >= 3 && deletable && (
          <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
            Oculto
          </span>
        )}
      </header>

      {target ? (
        <div className="flex gap-3 rounded-xl bg-muted/50 p-3">
          {target.thumbUrl && (
            <img src={target.thumbUrl} alt="" loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0 flex-1 text-sm">
            <Link to={`/u/${target.owner.username}`} className="flex items-center gap-2 font-medium hover:underline">
              <UserAvatar user={target.owner} className="size-6 text-[10px]" />@{target.owner.username}
            </Link>
            {target.text && <p className="mt-1 line-clamp-3 break-words">{target.text}</p>}
          </div>
          {target.link && (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to={target.link} aria-label="Abrir lo reportado">
                <ExternalLink />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">Ya no existe (se borro).</p>
      )}

      <ul className="flex flex-col gap-2 text-sm">
        {group.reports.map((report) => (
          <li key={report.reporter.username} className="flex flex-col">
            <span>
              <span className="font-medium">{reasonLabel[report.reason]}</span>{' '}
              <span className="text-muted-foreground">
                por @{report.reporter.username}, {formatTimeAgo(report.createdAt)}
              </span>
            </span>
            {report.details && <span className="break-words text-muted-foreground">"{report.details}"</span>}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap justify-end gap-2">
        {(resolve.isError || remove.isError) && (
          <p role="alert" className="mr-auto self-center text-sm text-destructive">
            No se pudo, intenta de nuevo
          </p>
        )}
        <Button variant="outline" disabled={busy} onClick={() => resolve.mutate(group)}>
          <ShieldCheck />
          Descartar
        </Button>
        {deletable && target && (
          <Button
            variant="destructive"
            disabled={busy}
            onBlur={() => setConfirmDelete(false)}
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              remove.mutate({ type: group.type as 'post' | 'comment' | 'listing', id: group.id })
            }}
          >
            <Trash2 />
            {confirmDelete ? 'Toca otra vez' : `Borrar ${TARGET_LABELS[group.type].toLowerCase()}`}
          </Button>
        )}
      </div>
    </article>
  )
}
