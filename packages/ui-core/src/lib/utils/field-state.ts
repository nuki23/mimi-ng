import {
  DestroyRef,
  InjectionToken,
  type Signal,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgControl, type ValidationErrors } from '@angular/forms';
import { FormField } from '@angular/forms/signals';

/**
 * Un error del campo, igual para los tres sistemas de formularios.
 *
 * - `kind`: la clave del error en minúsculas (`required`, `email`, `minlength`…). Signal Forms
 *   usa `minLength` / `maxLength`; se normalizan a los nombres de Reactive Forms.
 * - `message`: el texto que trae el error (Signal Forms, desde el esquema de validación).
 * - `params`: los datos del error con los nombres de Reactive Forms (`requiredLength`,
 *   `actualLength`, `min`, `max`, `requiredPattern`…).
 */
export interface MimiFieldError {
  kind: string;
  message?: string;
  params: Record<string, unknown>;
}

/** Estado de un campo de formulario, como signals (spec, sección 8). */
export interface MimiFieldState {
  invalid: Signal<boolean>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  disabled: Signal<boolean>;
  /** Inválido y ya tocado o modificado: el momento de mostrar el error. */
  showError: Signal<boolean>;
  /** Errores actuales, en orden. */
  errors: Signal<readonly MimiFieldError[]>;
}

/**
 * Lo que un control le cuenta a `mimi-form-field`: su elemento (para el `id` y el
 * `aria-describedby`), su estado y si muestra el error (el formulario o `showError` a mano).
 * Lo proveen Input, Textarea, Switch y Checkbox.
 */
export interface MimiFieldControl {
  readonly controlElement: HTMLElement;
  readonly fieldState: MimiFieldState;
  readonly showInvalid: Signal<boolean>;
}

export const MIMI_FIELD_CONTROL = new InjectionToken<MimiFieldControl>('MIMI_FIELD_CONTROL');

interface Snapshot {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
  errors: readonly MimiFieldError[];
}

const EMPTY: Snapshot = {
  invalid: false,
  touched: false,
  dirty: false,
  disabled: false,
  errors: [],
};

/**
 * Lee el estado del campo del elemento actual, sea cual sea el sistema de formularios:
 *
 * - Signal Forms (`[formField]`): usa `FormField.state()`, que ya son signals.
 * - Reactive Forms (`formControlName`, `[formControl]`) y `[(ngModel)]`: se suscribe a
 *   `control.events` (los flags de AbstractControl no son signals, CLAUDE.md regla 7).
 * - Sin formulario: todo en `false`.
 *
 * Con `formControlName` / `[formControl]` el control existe recién después de que esa directiva
 * procesa sus entradas, que puede ser después de crear la nuestra; por eso la suscripción se
 * intenta enseguida y, si todavía no hay control, después del primer render.
 *
 * Debe llamarse en un contexto de inyección (inicializador de una propiedad).
 */
export function injectFieldState(): MimiFieldState {
  const formField = inject(FormField, { optional: true, self: true });
  if (formField) {
    const state = computed(() => formField.state());
    return build(
      computed<Snapshot>(() => ({
        invalid: state().invalid(),
        touched: state().touched(),
        dirty: state().dirty(),
        disabled: state().disabled(),
        errors: state()
          .errors()
          .map((error) => fromSignalError(error)),
      })),
    );
  }

  const snapshot = signal<Snapshot>(EMPTY);
  const ngControl = inject(NgControl, { optional: true, self: true });
  if (ngControl) {
    const destroyRef = inject(DestroyRef);
    let connected = false;
    const connect = () => {
      const control = ngControl.control;
      if (connected || !control) return;
      connected = true;
      const read = () =>
        snapshot.set({
          invalid: control.invalid,
          touched: control.touched,
          dirty: control.dirty,
          disabled: control.disabled,
          errors: fromValidationErrors(control.errors),
        });
      read();
      const subscription = control.events.subscribe(read);
      destroyRef.onDestroy(() => subscription.unsubscribe());
    };
    connect();
    afterNextRender(connect);
  }
  return build(snapshot);
}

/** Estado vacío (sin formulario). Útil para controles que todavía no conocen su formulario. */
export function emptyFieldState(): MimiFieldState {
  return build(signal(EMPTY));
}

function build(snapshot: Signal<Snapshot>): MimiFieldState {
  return {
    invalid: computed(() => snapshot().invalid),
    touched: computed(() => snapshot().touched),
    dirty: computed(() => snapshot().dirty),
    disabled: computed(() => snapshot().disabled),
    showError: computed(() => snapshot().invalid && (snapshot().touched || snapshot().dirty)),
    errors: computed(() => snapshot().errors, { equal: sameErrors }),
  };
}

const sameErrors = (a: readonly MimiFieldError[], b: readonly MimiFieldError[]) =>
  a.length === b.length && a.every((e, i) => e.kind === b[i].kind && e.message === b[i].message);

/** Error de Signal Forms → MimiFieldError (nombres de Reactive Forms en params). */
function fromSignalError(error: { kind: string; message?: string }): MimiFieldError {
  const data = error as unknown as Record<string, unknown>;
  const kind = error.kind.toLowerCase();
  const params: Record<string, unknown> = { ...data };
  if (kind === 'minlength') params['requiredLength'] = data['minLength'];
  if (kind === 'maxlength') params['requiredLength'] = data['maxLength'];
  delete params['fieldTree'];
  return { kind, message: error.message, params };
}

/** ValidationErrors de Reactive Forms / ngModel → MimiFieldError[], en orden. */
function fromValidationErrors(errors: ValidationErrors | null): MimiFieldError[] {
  if (!errors) return [];
  return Object.entries(errors).map(([key, value]) => ({
    kind: key.toLowerCase(),
    params: value && typeof value === 'object' ? (value as Record<string, unknown>) : {},
  }));
}
