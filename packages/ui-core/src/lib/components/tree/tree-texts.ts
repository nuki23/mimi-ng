import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del Tree, en archivo propio y sin @angular/cdk: así se pueden proveer en `app.config.ts`
 * sin llevar el Tree al chunk inicial.
 */

/** Textos que el Tree muestra o anuncia. */
export interface MimiTreeText {
  /** Fila mientras se cargan los hijos de un nodo (carga diferida). */
  loading: string;
  /** Fila cuando la carga falla; se reintenta al volver a abrir el nodo. */
  loadError: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_TREE_TEXT_EN: MimiTreeText = {
  loading: 'Loading…',
  loadError: 'Couldn’t load. Close and open it again to retry.',
};

/** Textos en español: `provideMimiTreeText(MIMI_TREE_TEXT_ES)`. */
export const MIMI_TREE_TEXT_ES: MimiTreeText = {
  loading: 'Cargando…',
  loadError: 'No se pudo cargar. Ciérralo y ábrelo para reintentar.',
};

/** Textos activos. Sin `provideMimiTreeText`, los predeterminados en inglés. */
export const MIMI_TREE_TEXT = new InjectionToken<MimiTreeText>('MIMI_TREE_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_TREE_TEXT_EN,
});

/**
 * Cambia los textos del Tree. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiTreeText(MIMI_TREE_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiTreeText(text: Partial<MimiTreeText>): Provider {
  return { provide: MIMI_TREE_TEXT, useValue: { ...MIMI_TREE_TEXT_EN, ...text } };
}
