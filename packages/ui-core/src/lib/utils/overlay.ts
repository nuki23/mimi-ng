import { CdkConnectedOverlay, type ConnectedPosition } from '@angular/cdk/overlay';
import { DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

/*
 * Posición, flecha, animación y seguimiento del scroll compartidos por los overlays de Mimi
 * (Popover, Tooltip, Select…). Usa @angular/cdk/overlay: impórtalo siempre con su archivo
 * concreto (`@/components/ui/utils/overlay`), nunca desde el índice de utils, que no lo reexporta
 * para no arrastrar el CDK a quien no lo usa.
 */

export type MimiOverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type MimiOverlayAlign = 'start' | 'center' | 'end';

/** Distancia mínima de un overlay al borde de la pantalla (no está en el diseño: spec 13, plan D6). */
export const MIMI_VIEWPORT_MARGIN = 8;

const OPPOSITE: Record<MimiOverlaySide, MimiOverlaySide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function connectedPosition(
  side: MimiOverlaySide,
  align: MimiOverlayAlign,
  offset: number,
): ConnectedPosition {
  if (side === 'top' || side === 'bottom') {
    return side === 'bottom'
      ? { originX: align, originY: 'bottom', overlayX: align, overlayY: 'top', offsetY: offset }
      : { originX: align, originY: 'top', overlayX: align, overlayY: 'bottom', offsetY: -offset };
  }
  const y = align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
  return side === 'right'
    ? { originX: 'end', originY: y, overlayX: 'start', overlayY: y, offsetX: offset }
    : { originX: 'start', originY: y, overlayX: 'end', overlayY: y, offsetX: -offset };
}

/** Las otras alineaciones, en orden de preferencia (la opuesta antes que el centro). */
const FALLBACK_ALIGNS: Record<MimiOverlayAlign, MimiOverlayAlign[]> = {
  start: ['end', 'center'],
  end: ['start', 'center'],
  center: ['start', 'end'],
};

/**
 * Posiciones para el CDK, en orden de preferencia: el lado pedido con la alineación pedida y
 * después con las otras dos; el lado opuesto, igual; y, por último, los otros dos lados
 * centrados. `offset` es la separación con el trigger.
 *
 * Las otras alineaciones del mismo lado (5.17a) evitan que en una pantalla chica el panel se
 * salga por un costado: en 360px, un menú de 240px alineado al inicio de un trigger cercano al
 * borde derecho no cabía en ninguna de las cuatro posiciones de antes y el CDK lo dejaba fuera.
 */
export function mimiConnectedPositions(
  side: MimiOverlaySide,
  align: MimiOverlayAlign,
  offset: number,
): ConnectedPosition[] {
  const others: MimiOverlaySide[] =
    side === 'top' || side === 'bottom' ? ['right', 'left'] : ['bottom', 'top'];
  const aligns = [align, ...FALLBACK_ALIGNS[align]];
  return [
    ...aligns.map((a) => connectedPosition(side, a, offset)),
    ...aligns.map((a) => connectedPosition(OPPOSITE[side], a, offset)),
    ...others.map((other) => connectedPosition(other, 'center', offset)),
  ];
}

/**
 * Posiciones para abrir en un punto (el puntero, en Context Menu): la esquina superior izquierda
 * del panel en el punto; si no cabe, se voltea a la izquierda del punto, hacia arriba o ambas.
 */
export function mimiPointPositions(): ConnectedPosition[] {
  return [
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  ];
}

/** Lado en el que quedó el overlay, según la posición que eligió el CDK. */
export function mimiPlacedSide({
  originX,
  originY,
  overlayX,
  overlayY,
}: ConnectedPosition): MimiOverlaySide {
  if (originY === 'bottom' && overlayY === 'top') return 'bottom';
  if (originY === 'top' && overlayY === 'bottom') return 'top';
  return originX === 'end' && overlayX === 'start' ? 'right' : 'left';
}

/**
 * Dónde va la flecha para que apunte al centro del trigger: distancia desde el borde del panel
 * (izquierdo arriba/abajo, superior a los lados), dentro del panel. null si aún no hay medidas.
 */
export function mimiArrowOffset(
  trigger: DOMRect,
  panel: DOMRect,
  side: MimiOverlaySide,
): string | null {
  if (panel.width === 0 || panel.height === 0) return null;
  const vertical = side === 'top' || side === 'bottom';
  const offset = vertical
    ? trigger.left + trigger.width / 2 - panel.left
    : trigger.top + trigger.height / 2 - panel.top;
  const size = vertical ? panel.width : panel.height;
  return `${Math.min(Math.max(offset, 0), size)}px`;
}

/**
 * Entrada y salida de los overlays, para el `styles` del componente. Valores de
 * --mimi-transition (spec 6.6): 0.15s cubic-bezier(.2,.8,.2,1), escala desde --mimi-press-scale.
 * Sin animación con movimiento reducido. El panel lleva `data-mimi-overlay-panel` y `data-state`.
 */
export const MIMI_OVERLAY_ANIMATION = `
  @keyframes mimi-overlay-in {
    from {
      opacity: 0;
      scale: var(--mimi-press-scale);
    }
  }
  @keyframes mimi-overlay-out {
    to {
      opacity: 0;
      scale: var(--mimi-press-scale);
    }
  }
  [data-mimi-overlay-panel][data-state='open'] {
    animation: mimi-overlay-in 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  [data-mimi-overlay-panel][data-state='closed'] {
    animation: mimi-overlay-out 0.15s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-mimi-overlay-panel] {
      animation: none !important;
    }
  }
`;

/**
 * ¿Se ve algo del elemento? Recorta su caja con la pantalla y con cada antepasado que recorta su
 * contenido (`overflow` distinto de `visible`): un campo dentro de un contenedor con scroll puede
 * estar en la pantalla y fuera de la vista de su contenedor.
 */
export function mimiInView(element: HTMLElement): boolean {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  const box = element.getBoundingClientRect();
  // Sin caja (sin medir, o sin maquetar todavía) no se puede saber: no se cierra por eso.
  if (box.width === 0 && box.height === 0) return true;
  let top = Math.max(box.top, 0);
  let left = Math.max(box.left, 0);
  let bottom = Math.min(box.bottom, view?.innerHeight ?? box.bottom);
  let right = Math.min(box.right, view?.innerWidth ?? box.right);
  for (let node = element.parentElement; node && node !== doc.body; node = node.parentElement) {
    const style = view?.getComputedStyle(node);
    const overflow = style ? `${style.overflow} ${style.overflowX} ${style.overflowY}` : '';
    if (!/auto|scroll|hidden|clip/.test(overflow)) continue;
    const clip = node.getBoundingClientRect();
    top = Math.max(top, clip.top);
    left = Math.max(left, clip.left);
    bottom = Math.min(bottom, clip.bottom);
    right = Math.min(right, clip.right);
  }
  return bottom > top && right > left;
}

/**
 * El panel sigue a su campo con el scroll de cualquier contenedor antepasado (13/11/2026). El CDK
 * solo recoloca con el scroll de la ventana y de los contenedores marcados con `cdkScrollable`:
 * con un `overflow: auto` cualquiera, el panel se quedaba fijo mientras el contenido se movía.
 * Escucha el scroll en la fase de captura (el evento no sube), una vez por cuadro: si el scroll
 * movió al campo, `update()` (recolocar) o, si el campo salió de la vista, `close()`. Devuelve la
 * función que deja de escuchar.
 */
export function mimiFollowScroll(
  origin: HTMLElement,
  update: () => void,
  close: () => void,
): () => void {
  const doc = origin.ownerDocument;
  const view = doc.defaultView;
  let frame = 0;
  const onScroll = (event: Event) => {
    const target = event.target;
    // Solo los scrolls que mueven al campo (no el de la lista del propio panel).
    if (!(target instanceof Node) || !target.contains(origin) || frame || !view) return;
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      if (mimiInView(origin)) update();
      else close();
    });
  };
  doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
  return () => {
    doc.removeEventListener('scroll', onScroll, { capture: true });
    if (frame) view?.cancelAnimationFrame(frame);
    frame = 0;
  };
}

/**
 * En el `<ng-template cdkConnectedOverlay>` de un panel: lo hace seguir a su campo con el scroll
 * de cualquier contenedor (`mimiFollowScroll`) mientras está abierto, y emite
 * `(mimiOverlayOutOfView)` cuando el campo sale de la vista, para que el componente lo cierre.
 * Con un origen que es un punto (Context Menu abierto con el puntero), no hace nada.
 */
@Directive({ selector: '[cdkConnectedOverlay][mimiOverlayFollow]' })
export class MimiOverlayFollow {
  private readonly connected = inject(CdkConnectedOverlay);
  /** El campo salió de la vista: el componente cierra el panel. */
  readonly outOfView = output<void>({ alias: 'mimiOverlayOutOfView' });

  constructor() {
    let stop: (() => void) | null = null;
    const attach = this.connected.attach.subscribe(() => {
      stop?.();
      const origin = originElement(this.connected.origin);
      stop = origin
        ? mimiFollowScroll(
            origin,
            () => this.connected.overlayRef?.updatePosition(),
            () => this.outOfView.emit(),
          )
        : null;
    });
    const detach = this.connected.detach.subscribe(() => {
      stop?.();
      stop = null;
    });
    inject(DestroyRef).onDestroy(() => {
      attach.unsubscribe();
      detach.unsubscribe();
      stop?.();
    });
  }
}

/** El elemento del origen del CDK (un elemento, un `ElementRef` o un `CdkOverlayOrigin`). */
function originElement(origin: CdkConnectedOverlay['origin']): HTMLElement | null {
  if (origin instanceof HTMLElement) return origin;
  if (origin instanceof ElementRef) return origin.nativeElement as HTMLElement;
  if (origin && 'elementRef' in origin) return origin.elementRef.nativeElement as HTMLElement;
  return null;
}

/**
 * Se resuelve cuando terminan las animaciones del elemento (la de salida). Sin animaciones
 * (movimiento reducido, o un entorno sin Web Animations), enseguida.
 */
export function mimiWaitForExit(element: HTMLElement | undefined): Promise<void> {
  const animations = element?.getAnimations?.() ?? [];
  return Promise.allSettled(animations.map((animation) => animation.finished)).then(
    () => undefined,
  );
}
