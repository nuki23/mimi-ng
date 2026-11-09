import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Sortable List, en archivo propio y sin @angular/cdk: así se pueden proveer en
 * `app.config.ts` sin llevar la lista (ni el drag-drop del cdk) al chunk inicial.
 */

/** Textos que la lista muestra o anuncia. `label` es el de `itemLabel`. */
export interface MimiSortableText {
  /** `aria-roledescription` de cada elemento. */
  roleDescription: string;
  /** Nombre del asa. */
  handle: (label: string) => string;
  /** Cómo se usa el teclado (en el `aria-describedby` del asa). */
  instructions: string;
  /** Al agarrar con el teclado. */
  grabbed: (label: string, position: number, total: number) => string;
  /** Al mover con el teclado. */
  moved: (label: string, position: number, total: number) => string;
  /** Al soltar (teclado o puntero). */
  dropped: (label: string, position: number, total: number) => string;
  /** Al cancelar con Escape. */
  canceled: (label: string, position: number, total: number) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_SORTABLE_TEXT_EN: MimiSortableText = {
  roleDescription: 'sortable item',
  handle: (label) => `Reorder ${label}`,
  instructions:
    'Press Space or Enter to grab, the arrow keys to move, Space or Enter to drop and Escape to cancel.',
  grabbed: (label, position, total) =>
    `${label} grabbed. Position ${position} of ${total}. Use the arrow keys to move it.`,
  moved: (label, position, total) => `${label}: position ${position} of ${total}.`,
  dropped: (label, position, total) => `${label} dropped at position ${position} of ${total}.`,
  canceled: (label, position, total) =>
    `Reordering canceled. ${label} is back at position ${position} of ${total}.`,
};

/** Textos en español: `provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)`. */
export const MIMI_SORTABLE_TEXT_ES: MimiSortableText = {
  roleDescription: 'elemento ordenable',
  handle: (label) => `Reordenar ${label}`,
  instructions:
    'Pulsa Espacio o Enter para agarrar, las flechas para mover, Espacio o Enter para soltar y Escape para cancelar.',
  grabbed: (label, position, total) =>
    `${label} agarrado. Lugar ${position} de ${total}. Usa las flechas para moverlo.`,
  moved: (label, position, total) => `${label}: lugar ${position} de ${total}.`,
  dropped: (label, position, total) => `${label} soltado en el lugar ${position} de ${total}.`,
  canceled: (label, position, total) =>
    `Se canceló. ${label} vuelve al lugar ${position} de ${total}.`,
};

/** Textos activos. Sin `provideMimiSortableText`, los predeterminados en inglés. */
export const MIMI_SORTABLE_TEXT = new InjectionToken<MimiSortableText>('MIMI_SORTABLE_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_SORTABLE_TEXT_EN,
});

/**
 * Cambia los textos de Sortable List. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiSortableText(text: Partial<MimiSortableText>): Provider {
  return { provide: MIMI_SORTABLE_TEXT, useValue: { ...MIMI_SORTABLE_TEXT_EN, ...text } };
}
