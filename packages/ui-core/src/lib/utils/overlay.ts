import type { ConnectedPosition } from '@angular/cdk/overlay';

/*
 * Posición, flecha y animación compartidas por los overlays de Mimi (Popover, Tooltip…). Usa
 * tipos de @angular/cdk/overlay: impórtalo siempre con su archivo concreto
 * (`@/components/ui/utils/overlay`), nunca desde el índice de utils, que no lo reexporta para no
 * arrastrar el CDK a quien no lo usa.
 */

export type MimiOverlaySide = 'top' | 'right' | 'bottom' | 'left';
export type MimiOverlayAlign = 'start' | 'center' | 'end';

/** Distancia mínima de un overlay al borde de la pantalla (no está en el diseño: spec 13, T.2a). */
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

/**
 * Posiciones para el CDK, en orden de preferencia: el lado y la alineación pedidos, el lado
 * opuesto y, por último, los otros dos lados centrados. `offset` es la separación con el trigger.
 */
export function mimiConnectedPositions(
  side: MimiOverlaySide,
  align: MimiOverlayAlign,
  offset: number,
): ConnectedPosition[] {
  const others: MimiOverlaySide[] =
    side === 'top' || side === 'bottom' ? ['right', 'left'] : ['bottom', 'top'];
  return [
    connectedPosition(side, align, offset),
    connectedPosition(OPPOSITE[side], align, offset),
    ...others.map((other) => connectedPosition(other, 'center', offset)),
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
 * Se resuelve cuando terminan las animaciones del elemento (la de salida). Sin animaciones
 * (movimiento reducido, o un entorno sin Web Animations), enseguida.
 */
export function mimiWaitForExit(element: HTMLElement | undefined): Promise<void> {
  const animations = element?.getAnimations?.() ?? [];
  return Promise.allSettled(animations.map((animation) => animation.finished)).then(
    () => undefined,
  );
}
