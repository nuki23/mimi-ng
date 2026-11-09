import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Data Table, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar la
 * tabla (ni sus componentes) al chunk inicial.
 */

/** Textos que la tabla muestra o anuncia. */
export interface MimiDataTableText {
  /** Texto de la búsqueda vacía (y su nombre). */
  search: string;
  clearSearch: string;
  /** Casilla del encabezado. */
  selectAll: string;
  /** Casilla de una fila; `label` es el valor de la primera columna. */
  selectRow: (label: string) => string;
  /** Contador de la barra de selección. */
  selected: (count: number) => string;
  clearSelection: string;
  /** Botón del filtro de una columna. */
  filter: (column: string) => string;
  clearFilters: string;
  density: string;
  compact: string;
  comfortable: string;
  /** Botón de expandir de una fila. */
  expand: (label: string) => string;
  /** Encabezados sin texto (para los lectores). */
  select: string;
  details: string;
  actions: string;
  loading: string;
  /** Sin datos. */
  empty: string;
  emptyHint: string;
  /** Sin resultados con la búsqueda o los filtros. */
  noResults: string;
  noResultsHint: string;
  /** Rango del pie: «1–10 of 48». */
  range: (from: number, to: number, total: number) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_DATA_TABLE_TEXT_EN: MimiDataTableText = {
  search: 'Search…',
  clearSearch: 'Clear search',
  selectAll: 'Select all rows on this page',
  selectRow: (label) => `Select ${label}`,
  selected: (count) => (count === 1 ? '1 selected' : `${count} selected`),
  clearSelection: 'Clear selection',
  filter: (column) => `Filter ${column}`,
  clearFilters: 'Clear filters',
  density: 'Density',
  compact: 'Compact',
  comfortable: 'Comfortable',
  expand: (label) => `Details of ${label}`,
  select: 'Select',
  details: 'Details',
  actions: 'Actions',
  loading: 'Loading…',
  empty: 'No data yet',
  emptyHint: 'When there are rows, they will appear here.',
  noResults: 'No results',
  noResultsHint: 'Try another search or clear the filters.',
  range: (from, to, total) => `${from}–${to} of ${total}`,
};

/** Textos en español: `provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES)`. */
export const MIMI_DATA_TABLE_TEXT_ES: MimiDataTableText = {
  search: 'Buscar…',
  clearSearch: 'Borrar búsqueda',
  selectAll: 'Seleccionar todas las filas de la página',
  selectRow: (label) => `Seleccionar ${label}`,
  selected: (count) => (count === 1 ? '1 seleccionada' : `${count} seleccionadas`),
  clearSelection: 'Quitar selección',
  filter: (column) => `Filtrar ${column}`,
  clearFilters: 'Limpiar filtros',
  density: 'Densidad',
  compact: 'Compacta',
  comfortable: 'Cómoda',
  expand: (label) => `Detalle de ${label}`,
  select: 'Seleccionar',
  details: 'Detalle',
  actions: 'Acciones',
  loading: 'Cargando…',
  empty: 'Todavía no hay datos',
  emptyHint: 'Cuando haya filas, aparecerán aquí.',
  noResults: 'Sin resultados',
  noResultsHint: 'Prueba con otra búsqueda o limpia los filtros.',
  range: (from, to, total) => `${from}–${to} de ${total}`,
};

/** Textos activos. Sin `provideMimiDataTableText`, los predeterminados en inglés. */
export const MIMI_DATA_TABLE_TEXT = new InjectionToken<MimiDataTableText>('MIMI_DATA_TABLE_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_DATA_TABLE_TEXT_EN,
});

/**
 * Cambia los textos de Data Table. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiDataTableText(text: Partial<MimiDataTableText>): Provider {
  return { provide: MIMI_DATA_TABLE_TEXT, useValue: { ...MIMI_DATA_TABLE_TEXT_EN, ...text } };
}
