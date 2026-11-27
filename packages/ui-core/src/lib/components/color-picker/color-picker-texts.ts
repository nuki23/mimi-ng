import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del Color Picker, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar
 * el componente al chunk inicial.
 */

export interface MimiColorPickerText {
  area: string;
  /** Los dos sliders del área (M.14): uno por eje. */
  saturation: string;
  brightness: string;
  hue: string;
  format: string;
  value: string;
  palette: string;
  recent: string;
  noRecent: string;
  /** Nombre del panel en el disparador. */
  pickColor: string;
  /** Aviso del campo cuando el OKLCH escrito se recortó a sRGB. */
  clipped: string;
  /** Descripción del disparador obligatorio de `mimi-color-input` (un `<button>` no admite `aria-required`). */
  required: string;
}

export const MIMI_COLOR_PICKER_TEXT_EN: MimiColorPickerText = {
  area: 'Saturation and brightness',
  saturation: 'Saturation',
  brightness: 'Brightness',
  hue: 'Hue',
  format: 'Format',
  value: 'Color value',
  palette: 'Palette',
  recent: 'Recent',
  noRecent: 'The colors you choose will appear here.',
  pickColor: 'Choose color',
  clipped: 'Adjusted to the closest sRGB color.',
  required: 'required',
};

export const MIMI_COLOR_PICKER_TEXT_ES: MimiColorPickerText = {
  area: 'Saturación y brillo',
  saturation: 'Saturación',
  brightness: 'Brillo',
  hue: 'Tono',
  format: 'Formato',
  value: 'Valor del color',
  palette: 'Paleta',
  recent: 'Recientes',
  noRecent: 'Los colores que elijas aparecerán aquí.',
  pickColor: 'Elegir color',
  clipped: 'Ajustado al color sRGB más cercano.',
  required: 'obligatorio',
};

export const MIMI_COLOR_PICKER_TEXT = new InjectionToken<MimiColorPickerText>(
  'MIMI_COLOR_PICKER_TEXT',
  { providedIn: 'root', factory: () => MIMI_COLOR_PICKER_TEXT_EN },
);

/** Cambia los textos del Color Picker. Lo que no definas sigue en inglés. */
export function provideMimiColorPickerText(text: Partial<MimiColorPickerText>): Provider {
  return { provide: MIMI_COLOR_PICKER_TEXT, useValue: { ...MIMI_COLOR_PICKER_TEXT_EN, ...text } };
}
