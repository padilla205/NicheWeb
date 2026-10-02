import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 grid h-16 grid-cols-[1fr_minmax(0,36rem)_1fr] items-center gap-6 border-b-2 bg-background px-6">
      <Link to="/" className="justify-self-start text-xl font-semibold tracking-tight">
        Niche
      </Link>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar prendas, outfits o personas..."
          aria-label="Buscar"
          className="pl-9"
        />
      </div>
      <div className="justify-self-end">
        <ThemeToggle />
      </div>
    </header>
  )
}
