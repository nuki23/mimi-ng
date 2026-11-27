import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del calendario, del Date Picker y del Date Range, en archivo propio: así se pueden
 * proveer en `app.config.ts` sin llevar los componentes al chunk inicial. Los nombres de meses y
 * días no van aquí: salen de `Intl.DateTimeFormat` con el idioma.
 */

export interface MimiCalendarText {
  /** Nombre del panel del Date Picker. */
  pickDate: string;
  /** Nombre del panel del Date Range. */
  pickRange: string;
  /** Botones de mes (o año, o página de años) anterior y siguiente. */
  previous: string;
  next: string;
  /** Botón del título, que cambia la vista (días → meses → años). */
  changeView: string;
  /** Leyenda del punto de hoy. */
  today: string;
  /** Botón que lleva al mes de hoy. */
  goToday: string;
  /** Se agrega al nombre de un día que no se puede elegir. */
  unavailable: string;
  /** Ayuda del rango con el inicio elegido. */
  pickEnd: string;
  /** Ayuda del rango sin elegir o con el periodo completo. */
  pickStart: string;
  /** Cuenta de días del rango: «7 días». */
  days: (count: number) => string;
  /** Descripción del disparador de un campo obligatorio (un `<button>` no admite `aria-required`). */
  required: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_CALENDAR_TEXT_EN: MimiCalendarText = {
  pickDate: 'Choose date',
  pickRange: 'Choose period',
  previous: 'Previous',
  next: 'Next',
  changeView: 'Change view',
  today: 'Today',
  goToday: 'Go to today',
  unavailable: 'unavailable',
  pickEnd: 'Choose the end date.',
  pickStart: 'Choose a day to start a new period.',
  days: (count) => `${count} ${count === 1 ? 'day' : 'days'}`,
  required: 'required',
};

/** Textos en español: `provideMimiCalendarText(MIMI_CALENDAR_TEXT_ES)`. */
export const MIMI_CALENDAR_TEXT_ES: MimiCalendarText = {
  pickDate: 'Elegir fecha',
  pickRange: 'Elegir periodo',
  previous: 'Anterior',
  next: 'Siguiente',
  changeView: 'Cambiar vista',
  today: 'Hoy',
  goToday: 'Ir a hoy',
  unavailable: 'no disponible',
  pickEnd: 'Elige el día final.',
  // «Elige» y no «Haz clic»: también con el dedo (revisión de accesibilidad de la 0.9.0, H6).
  pickStart: 'Elige un día para empezar un periodo nuevo.',
  days: (count) => `${count} ${count === 1 ? 'día' : 'días'}`,
  required: 'obligatorio',
};

/** Textos activos. Sin `provideMimiCalendarText`, los predeterminados en inglés. */
export const MIMI_CALENDAR_TEXT = new InjectionToken<MimiCalendarText>('MIMI_CALENDAR_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_CALENDAR_TEXT_EN,
});

/** Cambia los textos del calendario, el Date Picker y el Date Range. Lo que no definas sigue en inglés. */
export function provideMimiCalendarText(text: Partial<MimiCalendarText>): Provider {
  return { provide: MIMI_CALENDAR_TEXT, useValue: { ...MIMI_CALENDAR_TEXT_EN, ...text } };
}
