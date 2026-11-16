import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos de la carga (R.23), en archivo propio y sin @angular/cdk: se pueden proveer en
 * `app.config.ts` sin llevar la capa al chunk inicial.
 */

/** Lo que muestra y anuncia la capa de carga. */
export interface MimiLoadingText {
  /** El mensaje si no das uno (y lo que se anuncia al empezar). */
  loading: string;
  /** Lo que se anuncia al terminar. */
  done: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_LOADING_TEXT_EN: MimiLoadingText = {
  loading: 'Loading…',
  done: 'Done.',
};

/** Textos en español: `provideMimiLoadingText(MIMI_LOADING_TEXT_ES)`. */
export const MIMI_LOADING_TEXT_ES: MimiLoadingText = {
  loading: 'Cargando…',
  done: 'Listo.',
};

/** Textos activos. Sin `provideMimiLoadingText`, los predeterminados en inglés. */
export const MIMI_LOADING_TEXT = new InjectionToken<MimiLoadingText>('MIMI_LOADING_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_LOADING_TEXT_EN,
});

/** Cambia los textos de la carga. Lo que no definas sigue en inglés. */
export function provideMimiLoadingText(text: Partial<MimiLoadingText>): Provider {
  return { provide: MIMI_LOADING_TEXT, useValue: { ...MIMI_LOADING_TEXT_EN, ...text } };
}
