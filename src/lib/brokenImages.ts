// Si una foto no carga (mala senal, se borro, link viejo) el navegador muestra un icono roto y el
// texto alternativo encima. En su lugar se pone un icono gris: una silueta en fotos de perfil y una
// playera en lo demas. Se escucha en todo el documento para cubrir cualquier foto de la app
const icon = (paths: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`,
  )}`

const SHIRT = icon(
  '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
)
const PERSON = icon('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>')

export function replaceBrokenImages() {
  window.addEventListener(
    'error',
    (event) => {
      const image = event.target
      // Solo fotos, y una sola vez por foto (si el icono tambien fallara no se repite)
      if (!(image instanceof HTMLImageElement) || image.dataset.broken !== undefined) return
      image.dataset.broken = ''
      image.src = image.closest('[data-avatar]') ? PERSON : SHIRT
    },
    // Los errores de imagenes no suben por el documento; hay que atraparlos al bajar
    true,
  )
}
