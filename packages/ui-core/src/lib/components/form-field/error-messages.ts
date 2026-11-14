import { InjectionToken, type Provider } from '@angular/core';
import type { MimiFieldError } from '@/components/ui/utils/field-state';

/**
 * Texto de un error, fijo o calculado con los datos del error. Los datos usan los nombres de
 * Reactive Forms en los tres sistemas: `requiredLength` (minlength / maxlength), `min`, `max`,
 * `requiredPattern`…
 */
export type MimiErrorMessage = string | ((params: Record<string, unknown>) => string);

/**
 * Mensajes por clave de error, en minúsculas (`required`, `email`, `minlength`…). `default`
 * se usa para cualquier error sin mensaje propio.
 */
export type MimiErrorMessages = Record<string, MimiErrorMessage>;

/** Mensajes predeterminados (inglés). */
export const MIMI_ERROR_MESSAGES_EN: MimiErrorMessages = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  minlength: (e) => `Use at least ${e['requiredLength']} characters.`,
  maxlength: (e) => `Use at most ${e['requiredLength']} characters.`,
  min: (e) => `The minimum value is ${e['min']}.`,
  max: (e) => `The maximum value is ${e['max']}.`,
  pattern: 'The format is not valid.',
  default: 'Check this field.',
};

/** Mensajes en español: `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)`. */
export const MIMI_ERROR_MESSAGES_ES: MimiErrorMessages = {
  required: 'Este campo es obligatorio.',
  email: 'Ingresa un correo válido.',
  minlength: (e) => `Usa al menos ${e['requiredLength']} caracteres.`,
  maxlength: (e) => `Usa como máximo ${e['requiredLength']} caracteres.`,
  min: (e) => `El valor mínimo es ${e['min']}.`,
  max: (e) => `El valor máximo es ${e['max']}.`,
  pattern: 'El formato no es válido.',
  default: 'Revisa este campo.',
};

/** Mensajes activos. Sin `provideMimiErrorMessages`, los predeterminados en inglés. */
export const MIMI_ERROR_MESSAGES = new InjectionToken<MimiErrorMessages>('MIMI_ERROR_MESSAGES', {
  providedIn: 'root',
  factory: () => MIMI_ERROR_MESSAGES_EN,
});

/**
 * Cambia los mensajes de error. Lo que no definas sigue en inglés:
 *
 * ```ts
 * provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)
 * provideMimiErrorMessages({ ...MIMI_ERROR_MESSAGES_ES, required: 'Obligatorio.' })
 * ```
 *
 * Va en `app.config.ts` o en los `providers` de un componente o ruta.
 */
export function provideMimiErrorMessages(messages: MimiErrorMessages): Provider {
  const normalized: MimiErrorMessages = {};
  for (const [key, value] of Object.entries(messages)) normalized[key.toLowerCase()] = value;
  return { provide: MIMI_ERROR_MESSAGES, useValue: { ...MIMI_ERROR_MESSAGES_EN, ...normalized } };
}

/**
 * Un validador de Reactive Forms (`ValidatorFn`), sin importar `@angular/forms`: recibe el control
 * y devuelve los errores o `null`.
 */
type MimiValidatorLike = (control: never) => Record<string, unknown> | null;

/**
 * El mensaje viaja con el validador (PD-3, opción B): `mimi-form-field` lo muestra sin escribir
 * `mimi-form-error`. En Signal Forms ya funciona con `required(path.user, { message: '…' })`.
 *
 * ```ts
 * user = new FormControl('', [
 *   withMessage(Validators.required, 'Elige un nombre de usuario.'),
 *   withMessage(Validators.minLength(3), (e) => `Mínimo ${e['requiredLength']} letras.`),
 * ]);
 * ```
 */
export function withMessage<V extends MimiValidatorLike>(
  validator: V,
  message: MimiErrorMessage,
): V {
  return ((control: never) => {
    const errors = validator(control);
    if (!errors) return errors;
    return Object.fromEntries(
      Object.entries(errors).map(([key, value]) => {
        const params = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
        const text = typeof message === 'function' ? message(params) : message;
        return [key, { ...params, message: text }];
      }),
    );
  }) as V;
}

/** Texto de un error: el `message` que trae (Signal Forms), el del mapa o `default`. */
export function mimiErrorText(error: MimiFieldError, messages: MimiErrorMessages): string {
  if (error.message) return error.message;
  const entry = messages[error.kind] ?? messages['default'] ?? MIMI_ERROR_MESSAGES_EN['default'];
  return typeof entry === 'function' ? entry(error.params) : entry;
}
