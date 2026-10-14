import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de Toast, en archivo propio y sin el componente ni @angular/cdk: así se pueden proveer
 * en `app.config.ts` sin llevar Toast al chunk inicial.
 */

/** Textos que Toast anuncia. */
export interface MimiToastText {
  /** Nombre de la región de los toasts, con la tecla que lleva el foco a ellos. */
  region: (hotkey: string) => string;
  /** Nombre accesible del botón de cerrar (la X). */
  close: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_TOAST_TEXT_EN: MimiToastText = {
  region: (hotkey) => `Notifications (${hotkey})`,
  close: 'Close notification',
};

/** Textos en español: `provideMimiToastText(MIMI_TOAST_TEXT_ES)`. */
export const MIMI_TOAST_TEXT_ES: MimiToastText = {
  region: (hotkey) => `Notificaciones (${hotkey})`,
  close: 'Cerrar notificación',
};

/** Textos activos. Sin `provideMimiToastText`, los predeterminados en inglés. */
export const MIMI_TOAST_TEXT = new InjectionToken<MimiToastText>('MIMI_TOAST_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_TOAST_TEXT_EN,
});

/**
 * Cambia los textos de Toast. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiToastText(MIMI_TOAST_TEXT_ES)
 * ```
 *
 * El nombre de la región se lee en la raíz: ponlo en `app.config.ts`. El de la X se lee donde se
 * llama a `injectMimiToast()`, así que también sirve en los `providers` de una ruta o componente.
 */
export function provideMimiToastText(text: Partial<MimiToastText>): Provider {
  return { provide: MIMI_TOAST_TEXT, useValue: { ...MIMI_TOAST_TEXT_EN, ...text } };
}
