import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Number Input, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar
 * el componente al chunk inicial (como Select, G1.5).
 */

/** Nombres accesibles de los botones. `label` es el nombre del campo (puede venir vacío). */
export interface MimiNumberInputText {
  decrement: (label: string) => string;
  increment: (label: string) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_NUMBER_INPUT_TEXT_EN: MimiNumberInputText = {
  decrement: (label) => (label ? `Decrease ${label}` : 'Decrease'),
  increment: (label) => (label ? `Increase ${label}` : 'Increase'),
};

/** Textos en español: `provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES)`. */
export const MIMI_NUMBER_INPUT_TEXT_ES: MimiNumberInputText = {
  decrement: (label) => (label ? `Disminuir ${label}` : 'Disminuir'),
  increment: (label) => (label ? `Aumentar ${label}` : 'Aumentar'),
};

/** Textos activos. Sin `provideMimiNumberInputText`, los predeterminados en inglés. */
export const MIMI_NUMBER_INPUT_TEXT = new InjectionToken<MimiNumberInputText>(
  'MIMI_NUMBER_INPUT_TEXT',
  { providedIn: 'root', factory: () => MIMI_NUMBER_INPUT_TEXT_EN },
);

/**
 * Cambia los textos de Number Input. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiNumberInputText(text: Partial<MimiNumberInputText>): Provider {
  return {
    provide: MIMI_NUMBER_INPUT_TEXT,
    useValue: { ...MIMI_NUMBER_INPUT_TEXT_EN, ...text },
  };
}
