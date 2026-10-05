import { MotionConfig } from 'motion/react'
import { PageTitle } from '@/components/PageTitle'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from './PostCard'

export function FeedPage() {
  const posts = usePosts()

  return (
    // Si el sistema pide menos movimiento, las animaciones del feed se reducen
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-xl">
        <PageTitle title="Feed" />
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}
