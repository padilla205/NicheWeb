import { Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { normalizeSize } from '@/lib/marketplace'
import { cn } from '@/lib/utils'

// Equivalencias aproximadas; cada marca talla distinto
const tables = [
  {
    title: 'Ropa (playeras, sudaderas, chamarras)',
    head: ['Talla', 'Pecho (cm)', 'Numero'],
    rows: [
      ['XS', '82 - 86', '28 - 30'],
      ['S', '87 - 92', '32 - 34'],
      ['M', '93 - 100', '36 - 38'],
      ['L', '101 - 108', '40 - 42'],
      ['XL', '109 - 116', '44 - 46'],
      ['XXL', '117 - 124', '48 - 50'],
    ],
  },
  {
    title: 'Pantalones y jeans',
    head: ['Talla', 'Cintura (cm)', 'Letra'],
    rows: [
      ['28', '71', 'XS'],
      ['30', '76', 'S'],
      ['32', '81', 'M'],
      ['34', '86', 'L'],
      ['36', '91', 'XL'],
      ['38', '97', 'XXL'],
    ],
  },
  {
    title: 'Calzado',
    head: ['Mexico (cm)', 'US hombre', 'US mujer'],
    rows: [
      ['23', '5', '6.5'],
      ['24', '6', '7.5'],
      ['25', '7', '8.5'],
      ['26', '8', '9.5'],
      ['27', '9', '10.5'],
      ['28', '10', '11.5'],
      ['29', '11', '12.5'],
    ],
  },
]

// Boton con una tabla de equivalencias de tallas; marca la fila que coincide con la talla de la venta
export function SizeGuide({ size }: { size: string }) {
  const current = normalizeSize(size)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="self-start">
          <Ruler />
          Guia de tallas
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="max-h-[var(--radix-popover-content-available-height)] w-[22rem] max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto p-4"
      >
        <h2 className="font-medium">Guia de tallas</h2>
        {tables.map((table) => (
          <section key={table.title} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{table.title}</h3>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  {table.head.map((cell) => (
                    <th key={cell} className="pb-1 font-normal first:pl-1">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row[0]} className={cn('border-t', row[0] === current && 'bg-muted font-medium')}>
                    {row.map((cell, i) => (
                      <td key={i} className="py-1 first:pl-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
        <p className="text-xs text-muted-foreground">
          Medidas aproximadas: cada marca talla distinto. Si tienes duda, pregunta las medidas al vendedor.
        </p>
      </PopoverContent>
    </Popover>
  )
}
