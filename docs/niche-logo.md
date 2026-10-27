# Logo de Niche

Simbolo de un gancho construido con una cinta doblada. Generado con la herramienta
integrada `image_gen` y fondo transparente; no se utilizo la API por CLI.

El original esta en `docs/assets/niche-mark-original.png`. La interfaz usa una copia
optimizada de 256 px en `public/brand/niche-mark.png` como mascara CSS para heredar
el color del texto, incluidos los fondos negros del celular.
Las versiones PNG para navegador y acceso directo conservan el dibujo sobre un
fondo `#F7F7F7`. La version maskable agrega margen para los recortes de Android.

El manifest define nombre e iconos del acceso directo. No agrega un service worker
ni funcionamiento sin conexion. En celulares que conserven el icono anterior puede
ser necesario quitar el acceso directo y volver a agregarlo tras publicar.

## Prompt original

```text
Use case: logo-brand
Asset type: production brand symbol for Niche, a digital wardrobe, outfit sharing and secondhand clothing web app.
Primary request: create one distinctive, minimal clothing-inspired logo symbol to replace a generic letter app icon.
Subject: a bold, elegant clothing hanger constructed from a continuous folded ribbon. One short curved hook at top, a wide open triangular shoulder silhouette, and one subtle diagonal overlapping fold near the bottom right. It must read first as an iconic clothing hanger, with a fashion-label sensibility and a memorable folded-ribbon construction.
Style: flat monochrome graphic, vector-like precision, strong simple silhouette, balanced optical spacing, thick consistent shapes with softly rounded corners. Premium understated contemporary fashion brand, suitable alongside Geist sans-serif typography.
Composition: one single centered symbol on a square canvas, occupying about 78 percent of the width and height with clear even padding. The open interior must be broad and uncluttered, readable at 24px.
Color: pure solid black symbol, truly transparent background and transparent interior negative space.
Text: none.
Constraints: no letters, no wordmark, no typography, no gradients, no shadows, no 3D, no thin strokes, no texture, no clothing mockups, no presentation board, no multiple alternatives, no background tile, no watermark. Deliver only the isolated final logo symbol.
```
