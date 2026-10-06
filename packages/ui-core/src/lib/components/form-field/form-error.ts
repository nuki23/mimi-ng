import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  type Signal,
  computed,
  inject,
  input,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';

/** Lo que `mimi-form-field` le pasa a su mensaje de error. */
export interface MimiFormFieldContext {
  /** id del mensaje: el control lo tiene en su `aria-describedby`. */
  readonly errorId: string;
  /** Hay que mostrar el error (inválido y tocado o modificado, o `showError` a mano). */
  readonly showError: Signal<boolean>;
  /** Texto del primer error, según los mensajes activos. */
  readonly message: Signal<string>;
}

export const MIMI_FORM_FIELD_CONTEXT = new InjectionToken<MimiFormFieldContext>(
  'MIMI_FORM_FIELD_CONTEXT',
);

/**
 * Mensaje de error de `mimi-form-field` (docs/design/Mimi Componentes.dc.html, sección 3):
 * 13px, color destructive y el ícono circle-alert de 14px.
 *
 * `mimi-form-field` ya muestra uno solo. Escríbelo solo para cambiar el texto
 * (`<mimi-form-error>Ese usuario ya existe.</mimi-form-error>`) o la posición.
 *
 * Siempre está en el DOM con `aria-live="polite"`: sin error queda vacío y fuera del flujo
 * (`sr-only`); al aparecer el error solo cambia su contenido, así los lectores lo anuncian.
 */
@Component({
  selector: 'mimi-form-error',
  template: `
    @if (context.showError()) {
      <!-- Lucide circle-alert -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <!-- Tu texto, si escribiste uno; si no, el del primer error. -->
      <span
        ><ng-content>{{ context.message() }}</ng-content></span
      >
    }
  `,
  host: {
    '[id]': 'context.errorId',
    'aria-live': 'polite',
    '[class]': 'classes()',
    '[attr.data-state]': 'context.showError() ? "visible" : "hidden"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiFormError {
  readonly userClass = input('', { alias: 'class' });

  protected readonly context = inject(MIMI_FORM_FIELD_CONTEXT);

  protected readonly classes = computed(() =>
    cn(
      'flex items-center gap-1.5 text-[13px] text-[color:var(--mimi-field-error,var(--mimi-destructive))] [&_svg]:size-3.5 [&_svg]:shrink-0',
      this.userClass(),
      // Sin error: vacío y fuera del flujo, pero en el DOM para que aria-live funcione.
      !this.context.showError() && 'sr-only',
    ),
  );
}
