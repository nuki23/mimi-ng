import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del Combobox, en archivo propio y sin @angular/aria ni @angular/cdk: así se pueden
 * proveer en `app.config.ts` sin llevar el Combobox al chunk inicial. Los de Select no se tocan.
 */

/** Textos que el Combobox muestra o anuncia. Los que dependen de un dato son funciones. */
export interface MimiComboboxText {
  /** Fila para crear un valor nuevo: «Crear «Tokio»». */
  create: (text: string) => string;
  /** Título cuando lo escrito no coincide con ninguna opción. */
  noResults: (text: string) => string;
  /** Detalle debajo del título de «sin resultados» (vacío: no se muestra). */
  noResultsHint: string;
  /** Título cuando no hay ninguna opción (sin haber escrito). */
  noOptions: string;
  /** Estado de carga, en el panel. */
  loading: string;
  /** Anuncio con la cantidad de resultados al escribir. */
  results: (count: number) => string;
  /** Ayuda debajo del campo, en el múltiple. */
  help: string;
  /** Chips ocultos con el múltiple cerrado y sin foco: «+2». */
  more: (count: number) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_COMBOBOX_TEXT_EN: MimiComboboxText = {
  create: (text) => `Create “${text}”`,
  noResults: (text) => `No results for “${text}”`,
  noResultsHint: 'Check the spelling or try another search.',
  noOptions: 'No options',
  loading: 'Searching…',
  results: (count) => `${count} ${count === 1 ? 'result' : 'results'}`,
  help: 'Enter adds · Backspace removes the last one',
  more: (count) => `+${count}`,
};

/** Textos en español: `provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES)`. */
export const MIMI_COMBOBOX_TEXT_ES: MimiComboboxText = {
  create: (text) => `Crear «${text}»`,
  noResults: (text) => `Sin resultados para «${text}»`,
  noResultsHint: 'Revisa la ortografía o prueba otra búsqueda.',
  noOptions: 'Sin opciones',
  loading: 'Buscando…',
  results: (count) => `${count} ${count === 1 ? 'resultado' : 'resultados'}`,
  help: 'Enter agrega · Backspace quita el último chip',
  more: (count) => `+${count}`,
};

/** Textos activos. Sin `provideMimiComboboxText`, los predeterminados en inglés. */
export const MIMI_COMBOBOX_TEXT = new InjectionToken<MimiComboboxText>('MIMI_COMBOBOX_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_COMBOBOX_TEXT_EN,
});

/**
 * Cambia los textos del Combobox. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES)
 * provideMimiComboboxText({ ...MIMI_COMBOBOX_TEXT_ES, loading: 'Buscando ciudades…' })
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiComboboxText(text: Partial<MimiComboboxText>): Provider {
  return { provide: MIMI_COMBOBOX_TEXT, useValue: { ...MIMI_COMBOBOX_TEXT_EN, ...text } };
}
