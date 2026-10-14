import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Confirm, en archivo propio y sin @angular/cdk: así se pueden proveer en
 * `app.config.ts` sin llevar el Dialog al chunk inicial.
 */

/** Textos de los botones de Confirm. */
export interface MimiConfirmText {
  /** Botón que confirma. */
  confirm: string;
  /** Botón que cancela. */
  cancel: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_CONFIRM_TEXT_EN: MimiConfirmText = {
  confirm: 'Confirm',
  cancel: 'Cancel',
};

/** Textos en español: `provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)`. */
export const MIMI_CONFIRM_TEXT_ES: MimiConfirmText = {
  confirm: 'Confirmar',
  cancel: 'Cancelar',
};

/** Textos activos. Sin `provideMimiConfirmText`, los predeterminados en inglés. */
export const MIMI_CONFIRM_TEXT = new InjectionToken<MimiConfirmText>('MIMI_CONFIRM_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_CONFIRM_TEXT_EN,
});

/**
 * Cambia los textos de Confirm. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta. `confirmText` y
 * `cancelText` de cada llamada ganan sobre estos.
 */
export function provideMimiConfirmText(text: Partial<MimiConfirmText>): Provider {
  return { provide: MIMI_CONFIRM_TEXT, useValue: { ...MIMI_CONFIRM_TEXT_EN, ...text } };
}
