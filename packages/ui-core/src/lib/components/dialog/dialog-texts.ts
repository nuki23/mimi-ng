import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Dialog, en archivo propio y sin @angular/cdk: así se pueden proveer en
 * `app.config.ts` sin llevar el Dialog al chunk inicial.
 */

/** Textos que Dialog anuncia. */
export interface MimiDialogText {
  /** Nombre accesible del botón de cerrar (la X). */
  close: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_DIALOG_TEXT_EN: MimiDialogText = {
  close: 'Close',
};

/** Textos en español: `provideMimiDialogText(MIMI_DIALOG_TEXT_ES)`. */
export const MIMI_DIALOG_TEXT_ES: MimiDialogText = {
  close: 'Cerrar',
};

/** Textos activos. Sin `provideMimiDialogText`, los predeterminados en inglés. */
export const MIMI_DIALOG_TEXT = new InjectionToken<MimiDialogText>('MIMI_DIALOG_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_DIALOG_TEXT_EN,
});

/**
 * Cambia los textos de Dialog. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiDialogText(MIMI_DIALOG_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiDialogText(text: Partial<MimiDialogText>): Provider {
  return { provide: MIMI_DIALOG_TEXT, useValue: { ...MIMI_DIALOG_TEXT_EN, ...text } };
}
