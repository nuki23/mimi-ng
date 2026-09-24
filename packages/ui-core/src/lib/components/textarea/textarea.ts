import { Directive, computed, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { injectFieldState } from '@/components/ui/utils/field-state';
import { textareaVariants } from './textarea.variants';

/**
 * Campo de varias líneas de Mimi sobre el `<textarea>` nativo: funciona con `[formField]`,
 * `formControlName`, `[formControl]` y `[(ngModel)]` (spec, sección 8). Con `rows="1"` queda
 * alineado al píxel con Input y Button.
 */
@Directive({
  selector: 'textarea[mimiTextarea]',
  exportAs: 'mimiTextarea',
  host: {
    '[class]': 'classes()',
    '[attr.aria-invalid]': 'showInvalid() ? "true" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'fieldState.disabled() ? "" : null',
  },
})
export class MimiTextarea {
  /**
   * Muestra el error a mano. `undefined` (por defecto): decide el formulario. `true`: lo muestra.
   * `false`: lo oculta aunque el formulario sea inválido.
   *
   * No se llama `invalid`: Signal Forms escribe su estado en cualquier entrada con ese nombre
   * (también touched, dirty, disabled, errors, required, name…) de las directivas del elemento.
   */
  readonly showError = input<boolean | undefined>(undefined);
  readonly userClass = input('', { alias: 'class' });

  /** Estado del campo según su formulario. Lo lee también MimiFormField (tarea 2.11). */
  readonly fieldState = injectFieldState();

  protected readonly showInvalid = computed(() => this.showError() ?? this.fieldState.showError());

  protected readonly classes = computed(() => cn(textareaVariants(), this.userClass()));
}
