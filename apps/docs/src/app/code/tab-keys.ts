/**
 * Teclado de las listas de pestañas hechas a mano (hasta que exista Tabs): flechas
 * izquierda/derecha (circulares), Inicio y Fin. Devuelve el índice nuevo o null si la tecla
 * no aplica. Quien llama selecciona la pestaña y le pasa el foco.
 */
export function nextTabIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

let nextId = 0;

/** Prefijo único para los id de pestañas y paneles (aria-controls / aria-labelledby). */
export function uniqueTabsId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}
