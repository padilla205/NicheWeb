import { ShieldCheck } from 'lucide-react'

// El trato es en persona y en efectivo: consejos cortos para que salga bien
const tips = [
  'Quedate de ver en un lugar publico y con gente, de preferencia de dia.',
  'Revisa la prenda antes de pagar: talla, costuras, manchas y detalles.',
  'Paga en efectivo al recibirla. No hagas depositos ni transferencias por adelantado.',
  'Si algo te parece raro, no sigas con el trato y reporta la venta.',
]

export function SafetyTips() {
  return (
    <section aria-labelledby="compra-segura" className="flex flex-col gap-2 rounded-2xl border bg-card p-4 text-sm">
      <h2 id="compra-segura" className="flex items-center gap-2 font-medium">
        <ShieldCheck className="size-4" />
        Compra segura
      </h2>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  )
}
