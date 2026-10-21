import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Pagination, en archivo propio y sin @angular/cdk ni Select: así se pueden proveer en
 * `app.config.ts` sin llevar la paginación al chunk inicial.
 */

/** Textos que Pagination muestra o anuncia. Los que dependen de un dato son funciones. */
export interface MimiPaginationText {
  /** Nombre de la región de navegación. */
  label: string;
  /** Nombre del botón ←. */
  previous: string;
  /** Nombre del botón →. */
  next: string;
  /** Nombre del campo de página, con el número de páginas: «Página, de 12». */
  page: (pages: number) => string;
  /** Nombre del selector de registros por página. */
  pageSize: string;
  /** Cada opción del selector: «10 / pág.». */
  pageSizeOption: (size: number) => string;
  /** Error del campo: «Entre 1 y 12». */
  outOfRange: (pages: number) => string;
  /** Anuncio al cambiar de página: «Página 3 de 12». */
  announce: (page: number, pages: number) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_PAGINATION_TEXT_EN: MimiPaginationText = {
  label: 'Pagination',
  previous: 'Previous page',
  next: 'Next page',
  page: (pages) => `Page, of ${pages}`,
  pageSize: 'Rows per page',
  pageSizeOption: (size) => `${size} / page`,
  outOfRange: (pages) => `Between 1 and ${pages}`,
  announce: (page, pages) => `Page ${page} of ${pages}`,
};

/** Textos en español: `provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)`. */
export const MIMI_PAGINATION_TEXT_ES: MimiPaginationText = {
  label: 'Paginación',
  previous: 'Página anterior',
  next: 'Página siguiente',
  page: (pages) => `Página, de ${pages}`,
  pageSize: 'Registros por página',
  pageSizeOption: (size) => `${size} / pág.`,
  outOfRange: (pages) => `Entre 1 y ${pages}`,
  announce: (page, pages) => `Página ${page} de ${pages}`,
};

/** Textos activos. Sin `provideMimiPaginationText`, los predeterminados en inglés. */
export const MIMI_PAGINATION_TEXT = new InjectionToken<MimiPaginationText>('MIMI_PAGINATION_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_PAGINATION_TEXT_EN,
});

/**
 * Cambia los textos de Pagination. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiPaginationText(text: Partial<MimiPaginationText>): Provider {
  return { provide: MIMI_PAGINATION_TEXT, useValue: { ...MIMI_PAGINATION_TEXT_EN, ...text } };
}
