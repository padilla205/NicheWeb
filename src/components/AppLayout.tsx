import { Outlet } from 'react-router'
import { MobileNav } from '@/components/MobileNav'
import { SideNav } from '@/components/SideNav'
import { TopBar } from '@/components/TopBar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="flex">
        <main className="min-w-0 flex-1 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:p-6">
          <Outlet />
        </main>
        <SideNav />
      </div>
      <MobileNav />
    </div>
  )
}
