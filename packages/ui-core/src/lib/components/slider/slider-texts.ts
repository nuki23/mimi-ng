import { InjectionToken, type Provider } from '@angular/core';

/** Textos de Slider, en archivo propio (como Select, G1.5). */
export interface MimiSliderText {
  /** Nombre del pulgar de abajo en el rango. */
  minimum: string;
  /** Nombre del pulgar de arriba en el rango. */
  maximum: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_SLIDER_TEXT_EN: MimiSliderText = { minimum: 'Minimum', maximum: 'Maximum' };

/** Textos en español: `provideMimiSliderText(MIMI_SLIDER_TEXT_ES)`. */
export const MIMI_SLIDER_TEXT_ES: MimiSliderText = { minimum: 'Mínimo', maximum: 'Máximo' };

/** Textos activos. Sin `provideMimiSliderText`, los predeterminados en inglés. */
export const MIMI_SLIDER_TEXT = new InjectionToken<MimiSliderText>('MIMI_SLIDER_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_SLIDER_TEXT_EN,
});

/** Cambia los textos de Slider. Lo que no definas sigue en inglés. */
export function provideMimiSliderText(text: Partial<MimiSliderText>): Provider {
  return { provide: MIMI_SLIDER_TEXT, useValue: { ...MIMI_SLIDER_TEXT_EN, ...text } };
}
