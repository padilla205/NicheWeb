import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Guarda en memoria lo que llega de Supabase; durante 1 minuto lo reutiliza sin volver a pedirlo
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    {/* Cuenta visitas de forma anonima (sin cookies) en el panel de Vercel; en local no manda nada */}
    <Analytics />
  </StrictMode>,
)
