import {
  MIMI_OVERLAY_ANIMATION,
  mimiArrowOffset,
  mimiConnectedPositions,
  mimiPlacedSide,
  mimiPointPositions,
  mimiWaitForExit,
} from './overlay';

const rect = (left: number, top: number, width: number, height: number) =>
  ({ left, top, width, height }) as DOMRect;

describe('utils/overlay', () => {
  it('posiciones: la pedida, las otras alineaciones del lado, el opuesto igual y los otros dos lados centrados', () => {
    const positions = mimiConnectedPositions('bottom', 'start', 12);
    expect(positions.map(mimiPlacedSide)).toEqual([
      'bottom',
      'bottom',
      'bottom',
      'top',
      'top',
      'top',
      'right',
      'left',
    ]);
    expect(positions[0]).toEqual({
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 12,
    });
    // 5.17a: en una pantalla chica, antes de cambiar de lado prueba alinear al final y al centro.
    expect(positions.slice(0, 3).map((p) => p.overlayX)).toEqual(['start', 'end', 'center']);
    expect(positions[3].offsetY).toBe(-12);
    expect(positions.slice(3, 6).map((p) => p.overlayX)).toEqual(['start', 'end', 'center']);
    expect(positions[6]).toMatchObject({ originY: 'center', overlayY: 'center', offsetX: 12 });
  });

  it('las otras alineaciones: end prueba start y center; center prueba start y end', () => {
    expect(
      mimiConnectedPositions('top', 'end', 8)
        .slice(0, 3)
        .map((p) => p.overlayX),
    ).toEqual(['end', 'start', 'center']);
    expect(
      mimiConnectedPositions('bottom', 'center', 8)
        .slice(0, 3)
        .map((p) => p.overlayX),
    ).toEqual(['center', 'start', 'end']);
  });

  it('a los lados, align pasa al eje vertical', () => {
    const positions = mimiConnectedPositions('right', 'end', 10);
    const [right, left] = [positions[0], positions[3]];
    expect(right).toEqual({
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 10,
    });
    expect(mimiPlacedSide(left)).toBe('left');
    expect(left.offsetX).toBe(-10);
  });

  it('en un punto: abajo a la derecha; si no cabe, a la izquierda, arriba o ambas', () => {
    const positions = mimiPointPositions();
    expect(positions.map((p) => `${p.overlayX}-${p.overlayY}`)).toEqual([
      'start-top',
      'end-top',
      'start-bottom',
      'end-bottom',
    ]);
    expect(positions.every((p) => p.originX === 'start' && p.originY === 'top')).toBe(true);
    expect(positions.some((p) => p.offsetX || p.offsetY)).toBe(false);
  });

  it('la flecha apunta al centro del trigger, sin salirse del panel', () => {
    expect(mimiArrowOffset(rect(100, 0, 40, 40), rect(60, 50, 300, 80), 'bottom')).toBe('60px');
    expect(mimiArrowOffset(rect(0, 100, 40, 40), rect(50, 90, 200, 60), 'right')).toBe('30px');
    expect(mimiArrowOffset(rect(900, 0, 40, 40), rect(60, 50, 300, 80), 'top')).toBe('300px');
    expect(mimiArrowOffset(rect(0, 0, 40, 40), rect(0, 0, 0, 0), 'top')).toBeNull();
  });

  it('animación con los valores de --mimi-transition y sin ella con movimiento reducido', () => {
    expect(MIMI_OVERLAY_ANIMATION).toContain('0.15s cubic-bezier(0.2, 0.8, 0.2, 1)');
    expect(MIMI_OVERLAY_ANIMATION).toContain('scale: var(--mimi-press-scale)');
    expect(MIMI_OVERLAY_ANIMATION).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
  });

  it('mimiWaitForExit se resuelve enseguida sin animaciones', async () => {
    await expect(mimiWaitForExit(undefined)).resolves.toBeUndefined();
    await expect(mimiWaitForExit(document.createElement('div'))).resolves.toBeUndefined();
  });
});
