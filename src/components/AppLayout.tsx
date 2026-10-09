import { Outlet } from 'react-router'
import { SideNav } from '@/components/SideNav'
import { TopBar } from '@/components/TopBar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="flex">
        <main className="min-w-0 flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6">
          <Outlet />
        </main>
        <SideNav />
      </div>
    </div>
  )
}
