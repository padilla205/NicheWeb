import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FunctionsHttpError } from '@supabase/supabase-js'
import imageCompression from 'browser-image-compression'
import { useSession } from '@/hooks/useAuth'
import { clothingColors, clothingZones, itemDecades } from '@/lib/clothing'
import { type GarmentScan, type RawScan, toGarmentScan } from '@/lib/garmentScan'
import { supabase } from '@/lib/supabase'

// Escaneos con IA que cada usuario puede hacer en 24 horas (el servidor tiene el mismo numero)
export const SCANS_PER_DAY = 10

// La IA no necesita fotos grandes: se achican mucho antes de enviarlas (menos espera y menos costo)
async function toBase64Jpeg(file: File) {
  const small = await imageCompression(file, { maxWidthOrHeight: 1024, maxSizeMB: 0.35, initialQuality: 0.8, fileType: 'image/jpeg', useWebWorker: true })
  const buffer = new Uint8Array(await small.arrayBuffer())
  let binary = ''
  for (let i = 0; i < buffer.length; i += 0x8000) binary += String.fromCharCode(...buffer.subarray(i, i + 0x8000))
  return { data: btoa(binary), mime: 'image/jpeg' }
}

export class ScanError extends Error {}

// Manda las fotos (maximo 3: frente, atras, etiqueta) a la funcion escanear-prenda y devuelve la ficha
export async function scanGarment(photos: File[]): Promise<GarmentScan> {
  const images = await Promise.all(photos.slice(0, 3).map(toBase64Jpeg))
  const { data, error } = await supabase.functions.invoke('escanear-prenda', {
    body: {
      photos: images,
      // Las listas de Niche, para que la IA responda con valores que la app entiende
      types: clothingZones.flatMap((zone) => zone.types.map((t) => ({ value: t.value, label: t.label }))),
      colors: clothingColors.map((c) => c.value),
      decades: itemDecades,
    },
  })
  if (error) {
    // El servidor explica que paso (limite diario, tope, etc.)
    const detail = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null
    throw new ScanError(detail?.message ?? detail?.error ?? 'No se pudo identificar la prenda. Revisa tu conexion e intenta de nuevo.')
  }
  const raw = data.scan as RawScan
  if (!raw?.identified) throw new ScanError('No parece una prenda. Prueba con otra foto, de frente y con buena luz.')
  return toGarmentScan(raw, data.sources ?? [])
}

// Cuantos escaneos le quedan hoy al usuario (cuenta los que salieron bien en las ultimas 24 horas)
export function useScansLeft() {
  const userId = useSession()?.user.id
  return useQuery({
    queryKey: ['scans-left', userId],
    enabled: !!userId,
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      const { count, error } = await supabase.from('item_scans').select('id', { count: 'exact', head: true }).eq('ok', true).gte('created_at', since)
      if (error) throw error
      return Math.max(0, SCANS_PER_DAY - (count ?? 0))
    },
  })
}

// Despues de escanear, vuelve a contar
export function useRefreshScansLeft() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['scans-left'] })
}
