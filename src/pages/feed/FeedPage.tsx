import { PageTitle } from '@/components/PageTitle'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'

export function FeedPage() {
  const posts = usePosts()

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Feed" />
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
