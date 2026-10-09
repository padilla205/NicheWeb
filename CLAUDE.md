# Niche

App de armario digital: archivo de prendas con fotos, generador de outfits aleatorios,
feed social con publicaciones, perfiles y marketplace de compra/venta entre usuarios.
Disponible en web y celular (PWA).

## Stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Motion (Framer Motion) para animaciones
- TanStack Query para datos y caché
- React Router para rutas
- Supabase: Auth, Postgres, Storage, Realtime
- PWA con vite-plugin-pwa
- Hosting: Vercel

## Entorno de desarrollo
- Sistema operativo: Arch Linux.
- Los comandos de terminal deben funcionar en Arch: usar `pacman` para paquetes del sistema (nunca `apt`, `brew` ni `winget`).
- Rutas y scripts en formato Linux (bash).

## Estructura de carpetas
- src/components/ui: componentes de shadcn/ui
- src/components: componentes propios reutilizables
- src/pages: una carpeta por pantalla (closet, outfits, feed, profile, marketplace, chat)
- src/hooks: hooks de datos (useItems, useOutfits, etc.) basados en TanStack Query
- src/lib: cliente de Supabase, utilidades, tipos
- supabase/migrations: todo cambio de base de datos como archivo SQL con timestamp

## Reglas de código
- Siempre TypeScript, sin `any` salvo justificación en un comentario.
- Componentes pequeños y con una sola responsabilidad.
- Sin emojis en la interfaz: solo iconos de lucide-react.
- Textos de la interfaz sin acentos ni caracteres especiales (nada de á, é, í, ó, ú, ñ, ¿, ¡ ni …). Ejemplo: "Closet", "Aqui veras tus prendas".
- Las consultas a Supabase van en hooks dentro de src/hooks, nunca directo en los componentes.
- Variables de entorno en .env.local (nunca se suben a git). Mantener un .env.example sin valores reales.
- Nunca poner claves secretas en el frontend; solo la anon key de Supabase.

## Base de datos y seguridad
- Toda tabla nueva lleva RLS (Row Level Security) activado, sin excepción.
- Políticas por defecto: el dueño lee y edita lo suyo; lectura pública solo cuando el contenido es público (outfits compartidos, publicaciones, anuncios activos).
- Los cambios de esquema se hacen como migraciones en supabase/migrations, no a mano en el panel.
- Tablas: profiles, items, outfits, outfit_items, posts, likes, comments, follows, listings, favorites, conversations, messages.

## Rendimiento y fluidez (obligatorio)
- Web primero: se diseña primero para escritorio y luego se adapta a celular.
- Actualizaciones optimistas (TanStack Query) en acciones frecuentes: like, guardar outfit, favorito.
- Skeletons en lugar de spinners mientras cargan listas y tarjetas.
- Comprimir las fotos en el cliente antes de subirlas a Storage (browser-image-compression) y mostrarlas con loading="lazy".
- Animaciones cortas (150 a 300 ms), pocas y con propósito.
- Paginación o scroll infinito en feed, clóset y marketplace; nunca cargar todo de golpe.

## Producto
- Sin pagos dentro de la app: el trato del marketplace se cierra fuera (efectivo en persona).
- Generador de outfits: elegir una prenda por categoría (arriba, abajo, zapatos y opcionalmente chamarra o accesorio), respetar prendas bloqueadas, filtrar por temporada y evitar combinaciones repetidas. Sin IA en el MVP.
- Los links públicos de outfits deben abrir una vista sin necesidad de iniciar sesión.

## Etapas de construcción
Se trabaja una etapa a la vez y se prueba en el navegador antes de avanzar:
1. Proyecto base, login y perfil
2. Clóset (subir y ver prendas)
3. Generador de outfits y guardado
4. Feed: publicar outfits, likes y comentarios
5. Seguidores y perfiles públicos
6. Marketplace (publicar, buscar, filtrar)
7. Chat comprador-vendedor
8. PWA, pulido y despliegue

## Flujo git
- Antes de empezar: `git pull` en main para tener lo último.
- Nunca se hace commit directo en main. Cada arreglo o actualización va en su propia rama, con el formato `tipo/descripcion-corta` (ej. `feat/barra-inferior-celular`, `fix/destello-blanco-detalle`).
- Mensajes de commit con Conventional Commits: `tipo: descripción en minúsculas`. Tipos:
  - `feat`: funcionalidad nueva
  - `fix`: arreglo de un error
  - `refactor`: reorganizar código sin cambiar lo que hace
  - `style`: solo apariencia o formato
  - `perf`: mejora de rendimiento
  - `docs`: documentación
  - `chore`: mantenimiento (dependencias, configuración)
  - `test`: pruebas
- Se sube la rama y se abre un Pull Request con `gh pr create`. El PR describe qué cambió, por qué y cómo se probó. Vercel crea una URL de vista previa para cada PR.
- El dueño del proyecto revisa el PR y la vista previa. Solo con su aprobación se hace merge a main, lo que publica en producción.
- Versiones: al cerrar un conjunto de cambios grande se sube la versión menor en package.json y se crea la etiqueta `vX.Y`.

## Forma de trabajar
- Se trabaja en tareas pequeñas, una a la vez. Solo se pasa a la siguiente cuando la actual quedó bien y el dueño del proyecto la aprobó.
- Antes de escribir código en una etapa nueva, presenta un plan breve y espera confirmación.
- Después de cada cambio importante, verifica que la app corre (`npm run dev`) y que `npm run build` no falla.
- Explica las decisiones técnicas en lenguaje sencillo; el dueño del proyecto está aprendiendo.
- Responde en español.