import { type PointerEvent, type WheelEvent, useRef, useState } from 'react'

const MAX_SCALE = 4
const DOUBLE_TAP_SCALE = 2.5
const DOUBLE_TAP_MS = 300

type Point = { x: number; y: number }
type Zoom = { scale: number; x: number; y: number }

const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 }

// Acerca la foto sin que se salga del cuadro: nunca se ve espacio vacio a los lados
function clamp(zoom: Zoom, box: DOMRect): Zoom {
  const scale = Math.min(MAX_SCALE, Math.max(1, zoom.scale))
  return {
    scale,
    x: Math.min(0, Math.max(box.width * (1 - scale), zoom.x)),
    y: Math.min(0, Math.max(box.height * (1 - scale), zoom.y)),
  }
}

// Cambia la escala dejando quieto el punto bajo el dedo o el mouse
function zoomAt(zoom: Zoom, point: Point, scale: number): Zoom {
  const ratio = scale / zoom.scale
  return { scale, x: point.x - (point.x - zoom.x) * ratio, y: point.y - (point.y - zoom.y) * ratio }
}

// Zoom para fotos en pantalla completa: pellizcar con dos dedos, rueda del mouse,
// doble toque o doble clic, y arrastrar para moverse cuando esta acercada
export function usePinchZoom() {
  const [zoom, setZoom] = useState(NO_ZOOM)
  const pointers = useRef(new Map<number, Point>())
  const lastTap = useRef({ time: 0, point: { x: 0, y: 0 } })
  // Si en el gesto actual hubo zoom, al soltar no se cambia de foto
  const zoomedDuringGesture = useRef(false)

  function local(event: { clientX: number; clientY: number; currentTarget: Element }) {
    const box = event.currentTarget.getBoundingClientRect()
    return { box, point: { x: event.clientX - box.left, y: event.clientY - box.top } }
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    const { box, point } = local(event)
    pointers.current.set(event.pointerId, point)
    if (pointers.current.size === 1) zoomedDuringGesture.current = zoom.scale > 1

    // Doble toque: acerca en ese punto, o regresa al tamano normal si ya estaba acercada
    const now = Date.now()
    const near = Math.hypot(point.x - lastTap.current.point.x, point.y - lastTap.current.point.y) < 30
    if (pointers.current.size === 1 && now - lastTap.current.time < DOUBLE_TAP_MS && near) {
      setZoom(zoom.scale > 1 ? NO_ZOOM : clamp(zoomAt(zoom, point, DOUBLE_TAP_SCALE), box))
      zoomedDuringGesture.current = true
      lastTap.current.time = 0
    } else {
      lastTap.current = { time: now, point }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const previous = pointers.current.get(event.pointerId)
    if (!previous) return
    const { box, point } = local(event)
    const others = [...pointers.current].filter(([id]) => id !== event.pointerId).map(([, p]) => p)
    pointers.current.set(event.pointerId, point)

    if (others.length === 1) {
      // Pellizco: la escala sigue la distancia entre los dedos y la foto sigue su punto medio
      const [other] = others
      const before = Math.hypot(previous.x - other.x, previous.y - other.y)
      const after = Math.hypot(point.x - other.x, point.y - other.y)
      if (before === 0) return
      const mid = { x: (point.x + other.x) / 2, y: (point.y + other.y) / 2 }
      const moved = { x: (point.x - previous.x) / 2, y: (point.y - previous.y) / 2 }
      zoomedDuringGesture.current = true
      setZoom((current) => {
        const scaled = zoomAt(current, mid, Math.min(MAX_SCALE, current.scale * (after / before)))
        return clamp({ ...scaled, x: scaled.x + moved.x, y: scaled.y + moved.y }, box)
      })
    } else if (others.length === 0 && zoom.scale > 1) {
      // Un dedo con la foto acercada: se mueve por la foto
      setZoom((current) =>
        clamp({ ...current, x: current.x + point.x - previous.x, y: current.y + point.y - previous.y }, box),
      )
    }
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    pointers.current.delete(event.pointerId)
  }

  function onWheel(event: WheelEvent<HTMLElement>) {
    const { box, point } = local(event)
    setZoom((current) => clamp(zoomAt(current, point, current.scale * Math.exp(-event.deltaY * 0.002)), box))
  }

  // Teclado (+ y -): acerca o aleja desde el centro del cuadro
  function step(factor: number, element: Element) {
    const box = element.getBoundingClientRect()
    const center = { x: box.width / 2, y: box.height / 2 }
    setZoom((current) => clamp(zoomAt(current, center, current.scale * factor), box))
  }

  return {
    zoom,
    step,
    zoomed: zoom.scale > 1,
    reset: () => setZoom(NO_ZOOM),
    // Al soltar: true si el gesto fue de zoom o de mover la foto acercada (no de cambiar de foto)
    wasZoomGesture: () => zoomedDuringGesture.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onWheel },
  }
}
