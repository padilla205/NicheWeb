import type { ClothingType, Season } from '@/lib/clothing'

// Borrador de la prenda que estas agregando, guardado en este dispositivo (IndexedDB, porque las
// fotos no caben en localStorage). Si la pagina se reinicia antes de guardar, no se pierde nada.
// Si el navegador no deja guardar (ventana privada), todo funciona igual, solo sin borrador

export type ItemDraft = {
  photos: File[]
  name: string
  type: ClothingType | ''
  seasons: Season[]
  colors: string[]
  team: string
  brand: string
  decade?: number
}

type StoredDraft = Omit<ItemDraft, 'photos'> & { photos: { name: string; blob: Blob }[] }

const STORE = 'drafts'

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('niche', 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const request = action(db.transaction(STORE, mode).objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).finally(() => db.close())
}

// Un borrador por cuenta, para que nadie vea el de otra persona en el mismo dispositivo
const keyOf = (userId: string) => `agregar-prenda:${userId}`

export async function saveItemDraft(userId: string, draft: ItemDraft) {
  const stored: StoredDraft = { ...draft, photos: draft.photos.map((file) => ({ name: file.name, blob: file })) }
  await run('readwrite', (store) => store.put(stored, keyOf(userId))).catch(() => {})
}

export async function loadItemDraft(userId: string): Promise<ItemDraft | null> {
  const stored = await run<StoredDraft | undefined>('readonly', (store) => store.get(keyOf(userId))).catch(() => undefined)
  if (!stored) return null
  return {
    ...stored,
    photos: stored.photos.map(({ name, blob }) => new File([blob], name, { type: blob.type })),
  }
}

export async function clearItemDraft(userId: string) {
  await run('readwrite', (store) => store.delete(keyOf(userId))).catch(() => {})
}
