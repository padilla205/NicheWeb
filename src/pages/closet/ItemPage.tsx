import { useNavigate, useParams } from 'react-router'
import { useSession } from '@/hooks/useAuth'
import { useItem } from '@/hooks/useItems'
import { EmptyTab } from '@/pages/profile/EmptyTab'
import { ItemDetail } from './ItemDetail'

// Una prenda abierta por su link (/prenda/:id); si no es tuya solo se ve
export function ItemPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = useSession()?.user.id
  const { data, isPending } = useItem(id)

  if (isPending) return null
  if (!data) return <EmptyTab>Esta prenda ya no esta disponible.</EmptyTab>
  return (
    <ItemDetail
      item={data.item}
      readOnly={data.ownerId !== userId}
      // Si se abrio directo (pestana nueva) no hay a donde regresar: va al closet
      onClose={() => (window.history.length > 1 ? navigate(-1) : navigate('/closet'))}
    />
  )
}
