import { MotionConfig } from 'motion/react'
import { PageTitle } from '@/components/PageTitle'
import { ShowMore } from '@/components/ShowMore'
import { usePaged } from '@/hooks/usePaged'
import { usePosts } from '@/hooks/usePosts'
import { FeaturedPosts } from './FeaturedPosts'
import { PostCard } from './PostCard'

// Publicaciones por bloque antes de "Ver mas"
const FEED_PAGE_SIZE = 10

export function FeedPage() {
  const posts = usePosts()
  const page = usePaged(posts, FEED_PAGE_SIZE)

  return (
    // Si el sistema pide menos movimiento, las animaciones del feed se reducen
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-xl">
        <PageTitle title="Feed" />
        <FeaturedPosts />
        <div className="flex flex-col gap-8">
          {page.visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <ShowMore shown={page.visible.length} total={page.total} onClick={page.showMore} />
      </div>
    </MotionConfig>
  )
}
