import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Command, en archivo propio y sin @angular/aria ni el cdk: así se pueden proveer en
 * `app.config.ts` sin llevar la paleta al chunk inicial.
 */

/** Textos que la paleta muestra o anuncia. */
export interface MimiCommandText {
  /** Texto del buscador vacío. */
  placeholder: string;
  /** Nombre del diálogo y de la lista, si no se da `aria-label`. */
  label: string;
  /** Ayuda del pie: las flechas. */
  navigate: string;
  /** Ayuda del pie: Enter. */
  run: string;
  /** Número de resultados (pie y región `status`). */
  results: (count: number) => string;
  /** Título de «sin resultados». */
  noResults: (query: string) => string;
  /** Texto de «sin resultados». */
  noResultsHint: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_COMMAND_TEXT_EN: MimiCommandText = {
  placeholder: 'Type a command or search…',
  label: 'Command palette',
  navigate: 'Navigate',
  run: 'Open',
  results: (count) => (count === 1 ? '1 result' : `${count} results`),
  noResults: (query) => `No results for “${query}”`,
  noResultsHint: 'Check the spelling or try another word.',
};

/** Textos en español: `provideMimiCommandText(MIMI_COMMAND_TEXT_ES)`. */
export const MIMI_COMMAND_TEXT_ES: MimiCommandText = {
  placeholder: 'Escribe un comando o busca…',
  label: 'Paleta de comandos',
  navigate: 'Navegar',
  run: 'Abrir',
  results: (count) => (count === 1 ? '1 resultado' : `${count} resultados`),
  noResults: (query) => `Sin resultados para «${query}»`,
  noResultsHint: 'Revisa la ortografía o prueba con otra palabra.',
};

/** Textos activos. Sin `provideMimiCommandText`, los predeterminados en inglés. */
export const MIMI_COMMAND_TEXT = new InjectionToken<MimiCommandText>('MIMI_COMMAND_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_COMMAND_TEXT_EN,
});

/**
 * Cambia los textos de Command. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiCommandText(MIMI_COMMAND_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiCommandText(text: Partial<MimiCommandText>): Provider {
  return { provide: MIMI_COMMAND_TEXT, useValue: { ...MIMI_COMMAND_TEXT_EN, ...text } };
}
