import { InjectionToken, type Provider } from '@angular/core';

/*
 * Opciones globales de Toast, en archivo propio y sin el componente: así `provideMimiToast()` se
 * puede poner en `app.config.ts` sin llevar Toast al chunk inicial.
 */

/** Dónde aparece la pila. El diseño solo muestra `bottom-right`. */
export type MimiToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/** Opciones de todos los toasts de la aplicación. */
export interface MimiToastConfig {
  /** Por defecto, `bottom-right`. */
  position: MimiToastPosition;
  /** Cuánto dura un toast sin acción, en milisegundos. Por defecto, 6000. */
  duration: number;
  /** Tecla (`KeyboardEvent.key`) que lleva el foco a los toasts. Por defecto, `F8`. */
  hotkey: string;
}

export const MIMI_TOAST_DEFAULTS: MimiToastConfig = {
  position: 'bottom-right',
  duration: 6000,
  hotkey: 'F8',
};

/** Opciones activas. Sin `provideMimiToast`, las predeterminadas. */
export const MIMI_TOAST_CONFIG = new InjectionToken<MimiToastConfig>('MIMI_TOAST_CONFIG', {
  providedIn: 'root',
  factory: () => MIMI_TOAST_DEFAULTS,
});

/**
 * Cambia las opciones de todos los toasts. Lo que no definas queda como está:
 *
 * ```ts
 * provideMimiToast({ position: 'top-center' })
 * ```
 *
 * Va en `app.config.ts`: los toasts viven en la raíz de la aplicación.
 */
export function provideMimiToast(config: Partial<MimiToastConfig>): Provider {
  return { provide: MIMI_TOAST_CONFIG, useValue: { ...MIMI_TOAST_DEFAULTS, ...config } };
}
