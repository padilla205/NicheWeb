type PageTitleProps = {
  title: string
  description?: string
}

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
    </div>
  )
}
