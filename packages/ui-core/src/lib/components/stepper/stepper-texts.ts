import { InjectionToken, type Provider } from '@angular/core';

/*
 * Textos del Stepper, en archivo propio: así se pueden proveer en `app.config.ts` sin llevar el
 * Stepper al chunk inicial.
 */

/** Textos que el Stepper muestra o anuncia. */
export interface MimiStepperText {
  /** Estado de un paso, bajo su título (si no tiene `description`) y para los lectores. */
  completed: string;
  current: string;
  pending: string;
  error: string;
  /** Marca de un paso que se puede saltar. */
  optional: string;
  /** Inicio del nombre de cada paso para los lectores: «Paso 2 de 5». */
  step: (index: number, total: number) => string;
  /** Lo que se anuncia al cambiar de paso: «Paso 2 de 5: Envío». */
  announce: (index: number, total: number, title: string) => string;
  /** Lo que se anuncia si no se puede dejar un paso: «Paso 1 de 3: Tú tiene errores». */
  invalid: (index: number, total: number, title: string) => string;
}

/** Textos predeterminados (inglés). */
export const MIMI_STEPPER_TEXT_EN: MimiStepperText = {
  completed: 'Completed',
  current: 'Current',
  pending: 'Pending',
  error: 'Error',
  optional: 'Optional',
  step: (index, total) => `Step ${index} of ${total}`,
  announce: (index, total, title) => `Step ${index} of ${total}: ${title}`,
  invalid: (index, total, title) => `Step ${index} of ${total}: ${title} has errors`,
};

/** Textos en español: `provideMimiStepperText(MIMI_STEPPER_TEXT_ES)`. */
export const MIMI_STEPPER_TEXT_ES: MimiStepperText = {
  completed: 'Completado',
  current: 'Actual',
  pending: 'Pendiente',
  error: 'Con error',
  optional: 'Opcional',
  step: (index, total) => `Paso ${index} de ${total}`,
  announce: (index, total, title) => `Paso ${index} de ${total}: ${title}`,
  invalid: (index, total, title) => `Paso ${index} de ${total}: ${title} tiene errores`,
};

/** Textos activos. Sin `provideMimiStepperText`, los predeterminados en inglés. */
export const MIMI_STEPPER_TEXT = new InjectionToken<MimiStepperText>('MIMI_STEPPER_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_STEPPER_TEXT_EN,
});

/**
 * Cambia los textos del Stepper. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiStepperText(MIMI_STEPPER_TEXT_ES)
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiStepperText(text: Partial<MimiStepperText>): Provider {
  return { provide: MIMI_STEPPER_TEXT, useValue: { ...MIMI_STEPPER_TEXT_EN, ...text } };
}
