import { PageTitle } from '@/components/PageTitle'
import { SharedPosts } from './SharedPosts'

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Perfil" />
      <SharedPosts />
    </div>
  )
}
