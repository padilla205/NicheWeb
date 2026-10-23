import { useNavigate, useParams } from 'react-router'
import { usePost } from '@/hooks/usePosts'
import { EmptyTab } from '@/pages/profile/EmptyTab'
import { PostDetail } from '@/pages/profile/PostDetail'

// Una publicacion abierta por su link (/p/:id); al cerrarla regresa a donde estabas
export function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: post, isPending } = usePost(id)

  if (isPending) return null
  if (!post) return <EmptyTab>Esta publicacion ya no existe.</EmptyTab>
  // Si se abrio directo (pestana nueva) no hay a donde regresar: va al feed
  return <PostDetail post={post} onClose={() => (window.history.length > 1 ? navigate(-1) : navigate('/feed'))} />
}
