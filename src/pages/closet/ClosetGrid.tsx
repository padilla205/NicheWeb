import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import type { ClosetItem } from '@/lib/clothing'
import { cascade } from '@/lib/motion'
import { ItemCard } from './ItemCard'
import { ItemDetail } from './ItemDetail'

type ClosetGridProps = {
  items: ClosetItem[]
  // Closet de otra persona: el detalle no trae opciones para editar
  readOnly?: boolean
}

export function ClosetGrid({ items, readOnly }: ClosetGridProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  // La ultima tarjeta abierta se queda por encima hasta que termina de regresar a su lugar
  const [raisedId, setRaisedId] = useState<string | null>(null)
  const openItem = items.find((item) => item.id === openId)

  const close = useCallback(() => setOpenId(null), [])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item, index) => (
          // Aparecen en cascada al cargar o al pedir mas
          <motion.div key={item.id} {...cascade(index)} className="grid">
            <ItemCard
              item={item}
              open={openId === item.id}
              raised={raisedId === item.id}
              onOpen={() => {
                setOpenId(item.id)
                setRaisedId(item.id)
              }}
              onLayoutAnimationComplete={() => {
                if (openId !== item.id && raisedId === item.id) setRaisedId(null)
              }}
            />
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {openItem && (
          <ItemDetail
            key={openItem.id}
            item={openItem}
            onClose={close}
            readOnly={readOnly}
          />
        )}
      </AnimatePresence>
    </>
  )
}
