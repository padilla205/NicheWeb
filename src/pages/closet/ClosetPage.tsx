import { Plus } from 'lucide-react'
import { useState } from 'react'
import { PageTitle } from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import type { ClothingType } from '@/lib/clothing'
import { ClosetEmpty } from './ClosetEmpty'
import { ClosetFilters } from './ClosetFilters'

export function ClosetPage() {
  const [selectedTypes, setSelectedTypes] = useState<ClothingType[]>([])

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Closet" description="Aqui veras todas tus prendas." />
        <div className="flex gap-2">
          <ClosetFilters selected={selectedTypes} onChange={setSelectedTypes} />
          <Button>
            <Plus />
            Agregar prenda
          </Button>
        </div>
      </div>
      <ClosetEmpty />
    </>
  )
}
