// Quitar el fondo de una foto en el navegador: la foto nunca sale del dispositivo. Usa ISNet
// (version int8 de imgly/isnet-general-onnx, licencia MIT) con transformers.js (licencia Apache).
// La libreria y el modelo (~44 MB de Hugging Face) solo se descargan la primera vez que alguien
// toca "Quitar fondo"; despues el navegador los guarda y las siguientes veces es mas rapido.
// BiRefNet lite se probo primero, pero sin tarjeta grafica compatible se quedaba sin memoria.
// Todo corre en un trabajador en segundo plano (removeBackground.worker.ts) para que la pantalla
// no se congele, y la foto se achica antes para no agotar la memoria del celular

import { MAX_PHOTO_SIDE } from '@/lib/photos'
import type { WorkerMessage, WorkerRequest } from './removeBackground.worker'

// Avance de la descarga del modelo (0 a 100) para mostrarlo en pantalla
export type ProgressListener = (percent: number) => void

// El trabajador se crea al primer uso y se queda vivo con el modelo cargado para las siguientes fotos
let worker: Worker | null = null
// Para poder cancelar: termina el trabajo en curso
let cancelCurrent: (() => void) | null = null

function getWorker() {
  worker ??= new Worker(new URL('./removeBackground.worker.ts', import.meta.url), { type: 'module' })
  return worker
}

// Detiene el trabajador por completo (cancelar o si se trabo). La proxima foto crea uno nuevo; el
// modelo ya descargado sigue guardado en el navegador
function stopWorker() {
  worker?.terminate()
  worker = null
}

export class RemoveBackgroundCancelled extends Error {}

// Devuelve la foto sin fondo (PNG con transparencia), con el lado mas largo de hasta 1600 px
export function removeBackground(file: File, onProgress?: ProgressListener) {
  return new Promise<File>((resolve, reject) => {
    const current = getWorker()
    const finish = () => {
      current.removeEventListener('message', onMessage)
      current.removeEventListener('error', onError)
      cancelCurrent = null
    }
    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data
      if (message.type === 'progress') return onProgress?.(message.percent)
      finish()
      if (message.type === 'done') {
        resolve(new File([message.blob], file.name.replace(/\.\w+$/, '') + '-sin-fondo.png', { type: 'image/png' }))
      } else {
        reject(new Error(message.message))
      }
    }
    // El trabajador se cayo (por ejemplo, sin memoria): se descarta y la pagina sigue viva
    const onError = (event: ErrorEvent) => {
      finish()
      stopWorker()
      reject(new Error(event.message || 'El trabajador se detuvo'))
    }
    current.addEventListener('message', onMessage)
    current.addEventListener('error', onError)
    cancelCurrent = () => {
      finish()
      stopWorker()
      reject(new RemoveBackgroundCancelled())
    }
    current.postMessage({ file, maxSide: MAX_PHOTO_SIDE } satisfies WorkerRequest)
  })
}

// Cancela la foto que se esta procesando (si hay una)
export function cancelRemoveBackground() {
  cancelCurrent?.()
}
