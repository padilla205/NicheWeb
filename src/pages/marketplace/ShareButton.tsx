import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// En el celular abre el menu de compartir del sistema (WhatsApp, Instagram...);
// en la computadora copia el link de la venta
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    if (navigator.share) {
      // Si la persona cierra el menu sin compartir, el navegador lanza un error que se ignora
      return navigator.share({ title, url }).catch(() => {})
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={share}>
      {copied ? <Check /> : <Share2 />}
      {copied ? 'Link copiado' : 'Compartir'}
    </Button>
  )
}
