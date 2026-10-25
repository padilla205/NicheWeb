// Cabeza de oso demoniaco para la pagina 404: SVG en linea con los colores de la paleta (funciona en
// claro y oscuro); el unico color son los ojos rojos, que brillan despacio
export function DemonBearIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      {/* Cuernos curvos que salen detras de las orejas */}
      <path d="M58 66C40 52 30 30 38 8c6 18 18 32 34 42z" className="fill-foreground" />
      <path d="M142 66c18-14 28-36 20-58-6 18-18 32-34 42z" className="fill-foreground" />
      {/* Orejas */}
      <circle cx="56" cy="72" r="22" className="fill-card stroke-foreground" strokeWidth="4" />
      <circle cx="144" cy="72" r="22" className="fill-card stroke-foreground" strokeWidth="4" />
      <circle cx="56" cy="72" r="10" className="fill-muted" />
      <circle cx="144" cy="72" r="10" className="fill-muted" />
      {/* Cabeza */}
      <ellipse cx="100" cy="114" rx="64" ry="60" className="fill-card stroke-foreground" strokeWidth="4" />
      {/* Cejas enojadas */}
      <path d="M64 90l30 14M136 90l-30 14" className="stroke-foreground" strokeWidth="5" strokeLinecap="round" />
      {/* Ojos rojos que brillan */}
      <g className="bear-eyes">
        <path d="M68 104l26 8-20 8z" fill="#ef4444" />
        <path d="M132 104l-26 8 20 8z" fill="#ef4444" />
      </g>
      {/* Hocico, nariz y boca con colmillos */}
      <ellipse cx="100" cy="146" rx="30" ry="22" className="fill-muted stroke-foreground" strokeWidth="3" />
      <path d="M88 134q12-8 24 0-12 12-24 0z" className="fill-foreground" />
      <path d="M100 141v8M80 152q20 14 40 0" className="stroke-foreground" strokeWidth="3" strokeLinecap="round" />
      <path d="M88 156l4 11 4-8zM112 156l-4 11-4-8z" className="fill-card stroke-foreground" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
