import { Directive, ElementRef, computed, inject, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import { type InputSize, inputVariants } from './input.variants';

/**
 * Campo de texto de Mimi sobre el `<input>` nativo: funciona con `[formField]`,
 * `formControlName`, `[formControl]` y `[(ngModel)]` sin adaptadores (spec, sección 8).
 *
 * Se pone en rojo con `aria-invalid="true"` cuando el campo es inválido y ya se tocó o
 * modificó. `showError` permite decidirlo a mano.
 */
@Directive({
  selector: 'input[mimiInput]',
  // mimi-form-field lo encuentra por este token (utils/field-state.ts).
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiInput }],
  exportAs: 'mimiInput',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'showInvalid() ? "true" : null',
    '[attr.data-size]': 'size()',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'fieldState.disabled() ? "" : null',
  },
})
export class MimiInput implements MimiFieldControl {
  readonly size = input<InputSize>('default');
  /**
   * Muestra el error a mano. `undefined` (por defecto): decide el formulario. `true`: lo muestra.
   * `false`: lo oculta aunque el formulario sea inválido.
   *
   * No se llama `invalid`: Signal Forms escribe su estado en cualquier entrada con ese nombre
   * (también touched, dirty, disabled, errors, required, name…) de las directivas del elemento.
   */
  readonly showError = input<boolean | undefined>(undefined);
  readonly userClass = input('', { alias: 'class' });

  /** Estado del campo según su formulario. Lo lee también MimiFormField. */
  readonly fieldState = injectFieldState();
  readonly controlElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Error visible: el formulario o `showError` a mano. */
  readonly showInvalid = computed(() => this.showError() ?? this.fieldState.showError());

  protected readonly classes = computed(() =>
    cn(inputVariants({ size: this.size() }), this.userClass()),
  );
}
