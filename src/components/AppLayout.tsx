import { MotionConfig, motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { MobileNav } from '@/components/MobileNav'
import { SideNav } from '@/components/SideNav'
import { TopBar } from '@/components/TopBar'

export function AppLayout() {
  // Solo la seccion: abrir un chat (/chat/:id) no vuelve a animar toda la pagina
  const section = useLocation().pathname.split('/')[1]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="flex">
        <main className="min-w-0 flex-1 p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:p-6">
          {/* Al cambiar de seccion el contenido entra subiendo; quien pide menos movimiento solo ve el cambio */}
          <MotionConfig reducedMotion="user">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0 }}
            >
              <Outlet />
            </motion.div>
          </MotionConfig>
        </main>
        <SideNav />
      </div>
      <MobileNav />
    </div>
  )
}
