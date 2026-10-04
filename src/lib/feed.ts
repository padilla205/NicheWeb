export type FeedUser = {
  username: string
  name: string
}

export type PostComment = {
  id: string
  author: FeedUser
  text: string
  createdAt: Date
}

export type Post = {
  id: string
  author: FeedUser
  caption: string
  // TEMPORAL: mientras no hay fotos reales, cada publicacion se dibuja con un degradado
  gradient: [string, string]
  createdAt: Date
  likes: number
  likedByMe: boolean
  comments: PostComment[]
}

// El usuario con sesion iniciada; se reemplaza por el perfil real cuando haya login
export const currentUser: FeedUser = { username: 'tu', name: 'Tu' }

const ana: FeedUser = { username: 'ana.style', name: 'Ana' }
const leo: FeedUser = { username: 'leo_fits', name: 'Leo' }
const sofi: FeedUser = { username: 'sofi', name: 'Sofia' }

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000)
}

// Publicaciones de ejemplo para ver el diseno sin base de datos
export const samplePosts: Post[] = [
  {
    id: 'p1',
    author: ana,
    caption: 'Outfit para el fin de semana',
    gradient: ['#f6d365', '#fda085'],
    createdAt: hoursAgo(2),
    likes: 24,
    likedByMe: false,
    comments: [
      { id: 'c1', author: leo, text: 'Me encanta la chamarra', createdAt: hoursAgo(1) },
      { id: 'c2', author: sofi, text: 'Donde compraste los tenis?', createdAt: hoursAgo(0.5) },
    ],
  },
  {
    id: 'p2',
    author: leo,
    caption: 'Dia de partido',
    gradient: ['#4facfe', '#00f2fe'],
    createdAt: hoursAgo(5),
    likes: 51,
    likedByMe: true,
    comments: [{ id: 'c3', author: ana, text: 'Que buen jersey', createdAt: hoursAgo(4) }],
  },
  {
    id: 'p3',
    author: sofi,
    caption: 'Todo negro para la oficina',
    gradient: ['#434343', '#000000'],
    createdAt: hoursAgo(26),
    likes: 8,
    likedByMe: false,
    comments: [],
  },
]

// "hace 5 min", "hace 2 h", "hace 3 d"
export function formatTimeAgo(date: Date) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return `hace ${Math.floor(hours / 24)} d`
}
