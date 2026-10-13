import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Select, en archivo propio y sin @angular/aria ni @angular/cdk: así se pueden proveer
 * en `app.config.ts` sin llevar el Select al chunk inicial.
 */

/** Textos que Select muestra o anuncia. Los que dependen de un dato son funciones. */
export interface MimiSelectText {
  /** Placeholder y nombre accesible del buscador, si no se da `searchPlaceholder`. */
  search: string;
  /** Contador del buscador: «3 resultados». */
  results: (count: number) => string;
  /** Título cuando no hay opciones que mostrar. */
  noResults: string;
  /** Detalle cuando la búsqueda no coincide con ninguna opción. */
  noResultsFor: (query: string) => string;
  /** Texto del estado de carga. */
  loading: string;
  /** Nombre accesible del botón de limpiar. */
  clear: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_SELECT_TEXT_EN: MimiSelectText = {
  search: 'Search…',
  results: (count) => `${count} ${count === 1 ? 'result' : 'results'}`,
  noResults: 'No results',
  noResultsFor: (query) => `No options match “${query}”.`,
  loading: 'Loading…',
  clear: 'Clear selection',
};

/** Textos en español: `provideMimiSelectText(MIMI_SELECT_TEXT_ES)`. */
export const MIMI_SELECT_TEXT_ES: MimiSelectText = {
  search: 'Buscar…',
  results: (count) => `${count} ${count === 1 ? 'resultado' : 'resultados'}`,
  noResults: 'Sin resultados',
  noResultsFor: (query) => `No hay opciones que coincidan con «${query}».`,
  loading: 'Cargando…',
  clear: 'Limpiar selección',
};

/** Textos activos. Sin `provideMimiSelectText`, los predeterminados en inglés. */
export const MIMI_SELECT_TEXT = new InjectionToken<MimiSelectText>('MIMI_SELECT_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_SELECT_TEXT_EN,
});

/**
 * Cambia los textos de Select. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiSelectText(MIMI_SELECT_TEXT_ES)
 * provideMimiSelectText({ ...MIMI_SELECT_TEXT_ES, loading: 'Cargando países…' })
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiSelectText(text: Partial<MimiSelectText>): Provider {
  return { provide: MIMI_SELECT_TEXT, useValue: { ...MIMI_SELECT_TEXT_EN, ...text } };
}
