// Quitar el fondo de una foto en el navegador: la foto nunca sale del dispositivo. Usa ISNet
// (version int8 de imgly/isnet-general-onnx, licencia MIT) con transformers.js (licencia Apache).
// La libreria y el modelo (~44 MB de Hugging Face) solo se descargan la primera vez que alguien
// toca "Quitar fondo"; despues el navegador los guarda y las siguientes veces es mas rapido.
// BiRefNet lite se probo primero, pero sin tarjeta grafica compatible se quedaba sin memoria

const MODEL = 'xrds/isnet-general-onnx-int8'

// Avance de la descarga del modelo (0 a 100) para mostrarlo en pantalla
export type ProgressListener = (percent: number) => void

type Remover = (image: string) => Promise<{ toBlob: (type?: string) => Promise<Blob> }>
type Device = 'webgpu' | 'wasm'
type GpuNavigator = Navigator & { gpu?: { requestAdapter(): Promise<object | null> } }

let loading: Promise<Remover> | null = null

// La tarjeta grafica (WebGPU) es mucho mas rapida; si el navegador no la tiene, se usa el procesador
async function hasGpu() {
  try {
    return !!(await (navigator as GpuNavigator).gpu?.requestAdapter())
  } catch {
    return false
  }
}

async function createRemover(device: Device, onProgress?: ProgressListener) {
  const { pipeline } = await import('@huggingface/transformers')
  // El modelo viene en varios archivos; se suma lo descargado de todos para un solo porcentaje
  const files = new Map<string, { loaded: number; total: number }>()
  const remover = await pipeline('background-removal', MODEL, {
    device,
    dtype: 'q8',
    progress_callback: (event: { status: string; file?: string; loaded?: number; total?: number }) => {
      if (event.status !== 'progress' || !event.file || !event.total) return
      files.set(event.file, { loaded: event.loaded ?? 0, total: event.total })
      const sum = [...files.values()].reduce((acc, f) => ({ loaded: acc.loaded + f.loaded, total: acc.total + f.total }), { loaded: 0, total: 0 })
      onProgress?.(Math.round((sum.loaded / sum.total) * 100))
    },
  })
  return remover as unknown as Remover
}

function loadRemover(onProgress?: ProgressListener) {
  loading ??= (async () => {
    if (await hasGpu()) {
      try {
        return await createRemover('webgpu', onProgress)
      } catch {
        // Algunas tarjetas graficas no lo soportan; se sigue con el procesador
      }
    }
    return createRemover('wasm', onProgress)
  })()
  // Si la descarga falla, la proxima vez se vuelve a intentar desde cero
  loading.catch(() => {
    loading = null
  })
  return loading
}

// Devuelve la foto sin fondo (PNG con transparencia), con el mismo tamano que la original
export async function removeBackground(file: File, onProgress?: ProgressListener) {
  const remover = await loadRemover(onProgress)
  const url = URL.createObjectURL(file)
  try {
    const result = await remover(url)
    const blob = await result.toBlob('image/png')
    return new File([blob], file.name.replace(/\.\w+$/, '') + '-sin-fondo.png', { type: 'image/png' })
  } finally {
    URL.revokeObjectURL(url)
  }
}
