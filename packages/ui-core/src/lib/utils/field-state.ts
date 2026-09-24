import { DestroyRef, type Signal, afterNextRender, computed, inject, signal } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals';

/** Estado de un campo de formulario, como signals (spec, sección 8). */
export interface MimiFieldState {
  invalid: Signal<boolean>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  disabled: Signal<boolean>;
  /** Inválido y ya tocado o modificado: el momento de mostrar el error. */
  showError: Signal<boolean>;
}

interface Snapshot {
  invalid: boolean;
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
}

const EMPTY: Snapshot = { invalid: false, touched: false, dirty: false, disabled: false };

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

function build(snapshot: Signal<Snapshot>): MimiFieldState {
  return {
    invalid: computed(() => snapshot().invalid),
    touched: computed(() => snapshot().touched),
    dirty: computed(() => snapshot().dirty),
    disabled: computed(() => snapshot().disabled),
    showError: computed(() => snapshot().invalid && (snapshot().touched || snapshot().dirty)),
  };
}
