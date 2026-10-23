// Tarjetas grises con la forma de las ventas mientras llegan de Supabase
export function ListingsSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
