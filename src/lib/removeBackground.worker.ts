// Trabajador en segundo plano que quita el fondo (ver removeBackground.ts). Aqui corre el modelo, asi
// la pantalla no se congela mientras trabaja. Recibe la foto y devuelve el PNG sin fondo

const MODEL = 'xrds/isnet-general-onnx-int8'

type Remover = (image: string) => Promise<{ toBlob: (type?: string) => Promise<Blob> }>
type Device = 'webgpu' | 'wasm'
type GpuNavigator = Navigator & { gpu?: { requestAdapter(): Promise<object | null> } }

export type WorkerRequest = { file: File; maxSide: number }
export type WorkerMessage =
  | { type: 'progress'; percent: number }
  | { type: 'done'; blob: Blob }
  | { type: 'error'; message: string }

const post = (message: WorkerMessage) => self.postMessage(message)

// En celulares se usa siempre el procesador: su tarjeta grafica (WebGPU) con este modelo int8 gasta
// mucha mas memoria o falla a media foto, y en iPhone eso cierra la pagina
const isPhone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1

async function hasGpu() {
  try {
    return !!(await (self.navigator as GpuNavigator).gpu?.requestAdapter())
  } catch {
    return false
  }
}

async function createRemover(device: Device) {
  const { pipeline } = await import('@huggingface/transformers')
  // El modelo viene en varios archivos; se suma lo descargado de todos para un solo porcentaje
  const files = new Map<string, { loaded: number; total: number }>()
  const remover = await pipeline('background-removal', MODEL, {
    device,
    dtype: 'q8',
    progress_callback: (event: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (event.status !== 'progress' || !event.file || !event.total) return
      files.set(event.file, { loaded: event.loaded ?? 0, total: event.total })
      const sum = [...files.values()].reduce((acc, f) => ({ loaded: acc.loaded + f.loaded, total: acc.total + f.total }), {
        loaded: 0,
        total: 0,
      })
      post({ type: 'progress', percent: Math.round((sum.loaded / sum.total) * 100) })
    },
  })
  return { run: remover as unknown as Remover, device }
}

let loading: Promise<{ run: Remover; device: Device }> | null = null

function loadRemover(device?: Device) {
  if (device) loading = createRemover(device)
  loading ??= (async () => {
    if (!isPhone && (await hasGpu())) {
      try {
        return await createRemover('webgpu')
      } catch {
        // Algunas tarjetas graficas no lo soportan; se sigue con el procesador
      }
    }
    return createRemover('wasm')
  })()
  // Si la descarga falla, la proxima vez se vuelve a intentar desde cero
  loading.catch(() => {
    loading = null
  })
  return loading
}

// Achica la foto para que su lado mas largo mida maxSide. El modelo trabaja a 1024 px de todos
// modos; con la foto original de la camara (12 a 48 megapixeles) la memoria se disparaba
async function shrink(file: File, maxSide: number) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  // PNG si la foto ya tenia transparencia; si no, JPEG, que es mucho mas ligero
  return canvas.convertToBlob(file.type === 'image/png' ? { type: 'image/png' } : { type: 'image/jpeg', quality: 0.92 })
}

async function removeBackground({ file, maxSide }: WorkerRequest) {
  const url = URL.createObjectURL(await shrink(file, maxSide))
  try {
    let remover = await loadRemover()
    let result
    try {
      result = await remover.run(url)
    } catch (error) {
      // Si la tarjeta grafica falla a media foto, se repite con el procesador
      if (remover.device !== 'webgpu') throw error
      remover = await loadRemover('wasm')
      result = await remover.run(url)
    }
    return result.toBlob('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    post({ type: 'done', blob: await removeBackground(event.data) })
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
}
