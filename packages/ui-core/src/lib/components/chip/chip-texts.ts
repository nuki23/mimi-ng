import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del chip compartido (Tags Input y el Combobox múltiple), en archivo propio: así se
 * pueden proveer en `app.config.ts` sin llevar los componentes al chunk inicial.
 */

export interface MimiChipText {
  /** Nombre del botón de quitar. */
  remove: (label: string) => string;
  /** Anuncio al agregar. */
  added: (label: string) => string;
  /** Anuncio al quitar. */
  removed: (label: string) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_CHIP_TEXT_EN: MimiChipText = {
  remove: (label) => `Remove ${label}`,
  added: (label) => `${label} added`,
  removed: (label) => `${label} removed`,
};

/** Textos en español: `provideMimiChipText(MIMI_CHIP_TEXT_ES)`. */
export const MIMI_CHIP_TEXT_ES: MimiChipText = {
  remove: (label) => `Quitar ${label}`,
  added: (label) => `${label} agregada`,
  removed: (label) => `${label} quitada`,
};

/** Textos activos. Sin `provideMimiChipText`, los predeterminados en inglés. */
export const MIMI_CHIP_TEXT = new InjectionToken<MimiChipText>('MIMI_CHIP_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_CHIP_TEXT_EN,
});

/** Cambia los textos del chip. Lo que no definas sigue en inglés. */
export function provideMimiChipText(text: Partial<MimiChipText>): Provider {
  return { provide: MIMI_CHIP_TEXT, useValue: { ...MIMI_CHIP_TEXT_EN, ...text } };
}
