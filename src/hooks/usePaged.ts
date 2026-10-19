import { useState } from 'react'

// Muestra una lista por bloques: al inicio solo pageSize elementos y "Ver mas" agrega otro bloque.
// Si cambia resetKey (por ejemplo, la busqueda o los filtros), vuelve al primer bloque.
// ponytail: corta una lista que ya esta completa en memoria; con Supabase cada bloque se pedira con .range()
export function usePaged<T>(items: T[], pageSize: number, resetKey = '') {
  const [state, setState] = useState({ key: resetKey, limit: pageSize })
  // Cualquier cambio de busqueda o filtros (incluso volver al anterior) regresa al primer bloque
  if (state.key !== resetKey) setState({ key: resetKey, limit: pageSize })
  const limit = state.key === resetKey ? state.limit : pageSize

  return {
    visible: items.slice(0, limit),
    total: items.length,
    showMore: () => setState({ key: resetKey, limit: limit + pageSize }),
  }
}
