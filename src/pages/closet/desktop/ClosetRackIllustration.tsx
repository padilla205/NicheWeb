// Perchero con prendas colgadas para el closet vacio en escritorio: SVG en linea (sin imagenes ni
// librerias), dibujado con los colores de la paleta para que funcione en claro y oscuro
export function ClosetRackIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" aria-hidden="true" className={className}>
      {/* Barra y patas del perchero */}
      <path d="M30 34h180M38 34v128M202 34v128M24 162h28M188 162h28" className="stroke-muted-foreground/50" strokeWidth="4" strokeLinecap="round" />
      {/* Gancho y playera */}
      <path d="M78 34c0-7 10-7 10 0v6" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 52l23-10 23 10-6 14-7-3v40H73V63l-7 3z" className="fill-muted stroke-muted-foreground/40" strokeWidth="2" strokeLinejoin="round" />
      {/* Gancho y vestido */}
      <path d="M126 34c0-7 10-7 10 0v6" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M121 44h20l-2 18 16 52h-48l16-52z" className="fill-primary/20 stroke-primary/50" strokeWidth="2" strokeLinejoin="round" />
      {/* Gancho y chamarra */}
      <path d="M170 34c0-7 10-7 10 0v6" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M156 50l19-8 19 8 4 52h-12v-36l-3 46h-16l-3-46v36h-12z" className="fill-card stroke-muted-foreground/40" strokeWidth="2" strokeLinejoin="round" />
      <path d="M175 46v48" className="stroke-muted-foreground/30" strokeWidth="1.5" />
      {/* Sombra en el piso */}
      <ellipse cx="120" cy="166" rx="92" ry="5" className="fill-muted-foreground/10" />
    </svg>
  )
}
