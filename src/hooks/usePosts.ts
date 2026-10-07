import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { currentUser, engagementScore, type Post, type PostComment, samplePosts } from '@/lib/feed'

// TEMPORAL: el feed usa publicaciones de ejemplo en la memoria del navegador hasta que conectemos
// Supabase. Los likes y comentarios se conservan al cambiar de seccion, pero se borran al recargar.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

let posts: Post[] = samplePosts
const listeners = new Set<() => void>()
const HOUR_MS = 60 * 60 * 1000

function rankFeaturedPosts() {
  return posts
    .filter((post) => engagementScore(post) > 0)
    .sort((a, b) => engagementScore(b) - engagementScore(a))
    .map((post) => post.id)
}

// Conserva el orden durante la hora, incluso al salir del feed y volver.
let featuredHour = Math.floor(Date.now() / HOUR_MS)
let featuredIds = rankFeaturedPosts()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function updatePost(id: string, change: (post: Post) => Post) {
  posts = posts.map((post) => (post.id === id ? change(post) : post))
  listeners.forEach((listener) => listener())
}

export function usePosts() {
  return useSyncExternalStore(subscribe, () => posts)
}

// Publicaciones que republicaste, para mostrarlas en tu perfil
export function useSharedPosts() {
  const all = usePosts()
  return useMemo(() => all.filter((post) => post.sharedByMe), [all])
}

// Los contadores de las tarjetas siguen en vivo; la seleccion solo cambia cada hora.
export function useFeaturedPosts(limit = 4) {
  const all = usePosts()
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    function tick() {
      const time = Date.now()
      const hour = Math.floor(time / HOUR_MS)
      if (hour !== featuredHour) {
        featuredIds = rankFeaturedPosts()
        featuredHour = hour
      }
      setNow(time)
    }

    // Lee el reloj real para recuperar el tiempo al volver de una pestana suspendida.
    tick()
    const interval = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])

  const hour = Math.floor(now / HOUR_MS)
  const ids = featuredIds
  const featured = useMemo(
    () =>
      ids
        .slice(0, limit)
        .map((id) => all.find((post) => post.id === id))
        .filter((post): post is Post => post !== undefined),
    [all, limit, ids],
  )

  return {
    featured,
    refreshAt: (hour + 1) * HOUR_MS,
    secondsRemaining: Math.ceil(((hour + 1) * HOUR_MS - now) / 1000),
  }
}

export function useToggleLike() {
  return (id: string) =>
    updatePost(id, (post) => ({
      ...post,
      likedByMe: !post.likedByMe,
      likes: post.likes + (post.likedByMe ? -1 : 1),
    }))
}

export function useAddComment() {
  return (id: string, text: string, reply?: PostComment['reply']) =>
    updatePost(id, (post) => ({
      ...post,
      comments: [
        ...post.comments,
        { id: crypto.randomUUID(), author: currentUser, text: text.trim(), createdAt: new Date(), reply },
      ],
    }))
}

export function useToggleShare() {
  return (id: string) => updatePost(id, (post) => ({ ...post, sharedByMe: !post.sharedByMe }))
}
