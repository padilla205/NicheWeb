import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local')

// La unica conexion a Supabase de toda la app. La clave es publica a proposito:
// lo que cada quien puede leer o editar lo deciden las politicas RLS de la base de datos.
export const supabase = createClient<Database>(url, key)
