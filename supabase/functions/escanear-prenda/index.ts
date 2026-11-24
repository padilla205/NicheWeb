// Funcion del servidor que identifica una prenda con Gemini 3.8 Flash y busqueda en Google.
// Vive aqui (y no en la app) para que la clave de Gemini nunca llegue al navegador.
// Recibe hasta 3 fotos ya achicadas, revisa la sesion y los limites, y devuelve la ficha.
import { createClient } from 'npm:@supabase/supabase-js@2'

const MODEL = 'gemini-3.8-flash'
// Escaneos por usuario en 24 horas
const USER_DAILY_LIMIT = 10
// Topes de busquedas para toda la app, un poco abajo de lo gratis de Google (1,500 al dia y 5,000 al
// mes): asi nunca se pagan busquedas, solo la parte barata de la IA
const GLOBAL_DAILY_SEARCHES = 1400
const GLOBAL_MONTHLY_SEARCHES = 4800
const MAX_PHOTOS = 3
// Fotos ya comprimidas en el celular; esto solo frena envios gigantes
const MAX_BASE64_CHARS = 6_000_000

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

type Photo = { data: string; mime: string }
type Lists = { types: { value: string; label: string }[]; colors: string[]; decades: number[] }

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido' }, 405)

  // Solo usuarios con sesion
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  const { data: auth } = await admin.auth.getUser(token)
  const user = auth.user
  if (!user) return json({ error: 'Inicia sesion para escanear' }, 401)

  let body: { photos?: Photo[] } & Partial<Lists>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Datos invalidos' }, 400)
  }
  const photos = (body.photos ?? []).slice(0, MAX_PHOTOS)
  const valid =
    photos.length > 0 &&
    photos.every((p) => typeof p.data === 'string' && /^image\/(jpeg|png|webp)$/.test(p.mime)) &&
    photos.reduce((sum, p) => sum + p.data.length, 0) <= MAX_BASE64_CHARS
  if (!valid) return json({ error: 'Fotos invalidas' }, 400)
  const lists: Lists = {
    types: (body.types ?? []).slice(0, 200),
    colors: (body.colors ?? []).slice(0, 40),
    decades: (body.decades ?? []).slice(0, 20),
  }

  // Limites: 10 escaneos por usuario en 24 horas y topes globales de busquedas
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 3600 * 1000).toISOString()
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString()
  const [mine, today, month] = await Promise.all([
    admin.from('item_scans').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('ok', true).gte('created_at', dayAgo),
    admin.from('item_scans').select('searches').gte('created_at', dayAgo),
    admin.from('item_scans').select('searches').gte('created_at', monthStart),
  ])
  const used = mine.count ?? 0
  if (used >= USER_DAILY_LIMIT) return json({ error: 'limite', message: `Ya usaste tus ${USER_DAILY_LIMIT} escaneos de hoy. Puedes llenar los datos a mano.` }, 429)
  const sum = (rows: { searches: number }[] | null) => (rows ?? []).reduce((acc, r) => acc + r.searches, 0)
  if (sum(today.data) >= GLOBAL_DAILY_SEARCHES || sum(month.data) >= GLOBAL_MONTHLY_SEARCHES) {
    return json({ error: 'tope', message: 'El escaneo esta muy ocupado. Vuelve mañana o llena los datos a mano.' }, 429)
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) return json({ error: 'El escaneo aun no esta configurado' }, 503)

  const year = new Date().getUTCFullYear()
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      model: MODEL,
      system_instruction: instructions(year, lists),
      input: [
        { type: 'text', text: 'Identifica esta prenda. Las fotos pueden ser frente, atras y etiqueta.' },
        ...photos.map((p) => ({ type: 'image', data: p.data, mime_type: p.mime })),
      ],
      tools: [{ type: 'google_search' }],
      response_format: { type: 'text', mime_type: 'application/json', schema: schema(year, lists) },
      generation_config: { thinking_level: 'medium' },
    }),
  })

  if (!response.ok) {
    console.error('Gemini', response.status, await response.text())
    await admin.from('item_scans').insert({ user_id: user.id, ok: false })
    return json({ error: 'No se pudo identificar la prenda. Intenta de nuevo.' }, 502)
  }

  const interaction = await response.json()
  const read = readInteraction(interaction)
  let scan: unknown
  try {
    scan = JSON.parse(read.text)
  } catch {
    console.error('Respuesta no es JSON', read.text.slice(0, 500))
    await admin.from('item_scans').insert({ user_id: user.id, ok: false, searches: read.searches })
    return json({ error: 'No se pudo identificar la prenda. Intenta de nuevo.' }, 502)
  }

  await admin.from('item_scans').insert({ user_id: user.id, ok: true, searches: read.searches })
  return json({ scan, sources: read.sources, remaining: USER_DAILY_LIMIT - used - 1 })
})

// Saca de la respuesta de Gemini el texto (el JSON), las paginas que cito y cuantas busquedas hizo
// deno-lint-ignore no-explicit-any -- la respuesta de la API de Gemini no trae tipos en Deno
function readInteraction(interaction: any) {
  // deno-lint-ignore no-explicit-any
  const steps: any[] = interaction.steps ?? []
  let text = typeof interaction.output_text === 'string' ? interaction.output_text : ''
  let searches = 0
  const sources = new Map<string, { title: string; url: string }>()
  for (const step of steps) {
    if (step.type === 'google_search_call') searches += Math.max(1, step.arguments?.queries?.length ?? 1)
    if (step.type !== 'model_output') continue
    for (const block of step.content ?? []) {
      if (block.type !== 'text') continue
      if (!interaction.output_text) text += block.text ?? ''
      for (const note of block.annotations ?? []) {
        if (note.type === 'url_citation' && typeof note.url === 'string' && note.url.startsWith('http')) {
          sources.set(note.url, { title: String(note.title ?? new URL(note.url).hostname), url: note.url })
        }
      }
    }
  }
  return { text, searches: Math.min(searches, 100), sources: [...sources.values()].slice(0, 5) }
}

function instructions(year: number, lists: Lists) {
  return `Eres el experto en ropa de Niche, una app mexicana de closet digital y reventa entre personas.
Te mandan fotos de UNA prenda (frente, atras y a veces la etiqueta). Identificala y estima su valor de reventa en Mexico.

Reglas para no dar informacion falsa:
- Usa la busqueda de Google para confirmar el modelo exacto y buscar precios reales de reventa en pesos mexicanos (Mercado Libre, Facebook Marketplace, eBay, Vinted, Depop, Grailed, tiendas de segunda mano).
- No inventes. Si no estas seguro de un dato, dejalo vacio ("" o 0) y baja la confianza.
- Si la marca no se ve ni se lee en la etiqueta, deja brand vacio.
- price.basis = "reventa" solo si encontraste anuncios o ventas reales de este modelo; en price.found pon cuantos. Si no, basis = "estimado" y found = 0.
- price.history: precio tipico de reventa en pesos para cada año de ${year - 4} a ${year}. Si no hay datos de algun año, estimalo con criterio, pero entonces basis debe ser "estimado".
- Si las fotos no muestran ropa, pon identified = false.

Formato:
- Escribe en español sin acentos (nada de a con acento, etc.), pero con ñ donde la palabra la lleva.
- model: nombre del modelo como se conoce en reventa (ej. "Jersey Xolos de Tijuana local 2012"). Si no sabes el modelo exacto, una descripcion corta ("Sudadera con capucha basica").
- description: 1 o 2 frases sobre la prenda.
- type: uno de los valores de la lista de tipos. Tipos (valor = nombre): ${lists.types.map((t) => `${t.value} = ${t.label}`).join('; ')}.
- colors: de 1 a 3 colores principales de esta lista: ${lists.colors.join(', ')}.
- decade: una de ${lists.decades.join(', ')}, o 0 si no sabes. year: año exacto si lo sabes, si no 0.
- rarity: "Comun", "Poco comun" o "Rara".
- confidence: "alta" si confirmaste el modelo, "media" si es probable, "baja" si no lo encontraste.`
}

function schema(year: number, lists: Lists) {
  const text = { type: 'string' }
  const int = { type: 'integer' }
  return {
    type: 'object',
    properties: {
      identified: { type: 'boolean' },
      model: text,
      brand: text,
      year: int,
      decade: lists.decades.length ? { type: 'integer', enum: [0, ...lists.decades] } : int,
      type: lists.types.length ? { type: 'string', enum: ['', ...lists.types.map((t) => t.value)] } : text,
      colors: { type: 'array', items: lists.colors.length ? { type: 'string', enum: lists.colors } : text, maxItems: 3 },
      description: text,
      style: text,
      rarity: { type: 'string', enum: ['Comun', 'Poco comun', 'Rara'] },
      tag: {
        type: 'object',
        properties: { size: text, material: text, madeIn: text },
        required: ['size', 'material', 'madeIn'],
      },
      confidence: { type: 'string', enum: ['alta', 'media', 'baja'] },
      price: {
        type: 'object',
        properties: {
          min: int,
          max: int,
          basis: { type: 'string', enum: ['reventa', 'estimado'] },
          found: int,
          history: {
            type: 'array',
            items: { type: 'object', properties: { year: int, price: int }, required: ['year', 'price'] },
            description: `Un elemento por año de ${year - 4} a ${year}`,
          },
        },
        required: ['min', 'max', 'basis', 'found', 'history'],
      },
    },
    required: ['identified', 'model', 'brand', 'year', 'decade', 'type', 'colors', 'description', 'style', 'rarity', 'tag', 'confidence', 'price'],
  }
}
