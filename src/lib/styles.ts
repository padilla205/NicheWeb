// Botones de icono de la barra de arriba (buscar, notificaciones, mensajes, tema): mismo tamano,
// forma y respuesta al tocar, para que se vean como un solo grupo
// (topbar-icon: en modo claro se vuelven circulos blancos, ver "Estilo ceramica" en index.css)
export const topBarIconClass =
  'topbar-icon relative flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,scale] duration-150 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:active:scale-[0.94] motion-reduce:transition-none'

// Cabecera negra de las pantallas en celular (closet, feed): lleva la clase dark para que todo lo de
// adentro se pinte en modo oscuro aunque la app este en claro
export const mobileHeroClass = 'dark -mx-4 -mt-4 bg-black px-4 pt-3 pb-12 text-foreground md:hidden'

// Hoja que sube sobre la cabecera negra en celular, con las esquinas de arriba redondeadas. Llega
// hasta abajo de la pantalla (cubre el espacio que se deja para la barra). En modo claro es blanca
// con cuadritos gris claro (ver .sheet en index.css)
export const mobileSheetClass =
  'sheet max-md:relative max-md:-mx-4 max-md:-mt-6 max-md:-mb-[calc(6.5rem+env(safe-area-inset-bottom))] max-md:rounded-t-[2rem] max-md:bg-background max-md:px-4 max-md:pt-5 max-md:pb-[calc(6.5rem+env(safe-area-inset-bottom))] dark:max-md:border-t dark:max-md:border-white/10'
