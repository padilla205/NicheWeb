import { useSyncExternalStore } from 'react'
import { currentUser, type Post, samplePosts } from '@/lib/feed'

// TEMPORAL: el feed usa publicaciones de ejemplo en la memoria del navegador hasta que conectemos
// Supabase. Los likes y comentarios se conservan al cambiar de seccion, pero se borran al recargar.
// Cuando llegue la base de datos, estos hooks se reemplazan por TanStack Query sin tocar las pantallas.

let posts: Post[] = samplePosts
const listeners = new Set<() => void>()

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

export function useToggleLike() {
  return (id: string) =>
    updatePost(id, (post) => ({
      ...post,
      likedByMe: !post.likedByMe,
      likes: post.likes + (post.likedByMe ? -1 : 1),
    }))
}

export function useAddComment() {
  return (id: string, text: string) =>
    updatePost(id, (post) => ({
      ...post,
      comments: [
        ...post.comments,
        { id: crypto.randomUUID(), author: currentUser, text: text.trim(), createdAt: new Date() },
      ],
    }))
}
