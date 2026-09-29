import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_FIELD_CONTROL } from '@/components/ui/utils/field-state';
import { MIMI_ERROR_MESSAGES, mimiErrorText } from './error-messages';
import { MIMI_FORM_FIELD_CONTEXT, type MimiFormFieldContext, MimiFormError } from './form-error';

let nextId = 0;

/**
 * Agrupa etiqueta, control y mensaje de error (docs/design/Mimi Componentes.dc.html,
 * sección 3), sin escribir un solo `@if`:
 *
 * ```html
 * <mimi-form-field label="Correo">
 *   <input mimiInput type="email" formControlName="email" />
 * </mimi-form-field>
 * ```
 *
 * - Encuentra el control (Input, Textarea, Switch o Checkbox) por `MIMI_FIELD_CONTROL`.
 * - `label` dibuja un `<label for>`; si proyectas tu propio `<label>` sin `for`, se lo asigna.
 *   Si el control no tiene `id`, le pone uno.
 * - Con error, la etiqueta se pone roja y aparece el mensaje del primer error. El control
 *   lleva el mensaje en su `aria-describedby`.
 * - Para cambiar el texto o la posición del mensaje, escribe `<mimi-form-error>`.
 */
@Component({
  selector: 'mimi-form-field',
  imports: [MimiFormError],
  template: `
    @if (label()) {
      <label [attr.for]="controlId()" [class]="labelClasses">{{ label() }}</label>
    }
    <ng-content />
    @if (!ownError()) {
      <mimi-form-error />
    }
  `,
  providers: [{ provide: MIMI_FORM_FIELD_CONTEXT, useExisting: MimiFormField }],
  host: {
    '[class]': 'classes()',
    '[attr.data-invalid]': 'showError() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiFormField implements MimiFormFieldContext {
  /** Texto de la etiqueta. También puedes proyectar tu propio `<label>`. */
  readonly label = input<string>();
  readonly userClass = input('', { alias: 'class' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly messages = inject(MIMI_ERROR_MESSAGES);
  private readonly control = contentChild(MIMI_FIELD_CONTROL, { descendants: true });
  protected readonly ownError = contentChild(MimiFormError, { descendants: true });

  private readonly baseId = `mimi-form-field-${nextId++}`;
  readonly errorId = `${this.baseId}-error`;
  /** id del control (el suyo o el que le asigna el form-field). */
  protected readonly controlId = signal<string | null>(null);

  readonly showError = computed(() => this.control()?.showInvalid() ?? false);
  protected readonly disabled = computed(() => this.control()?.fieldState.disabled() ?? false);
  readonly message = computed(() => {
    const error = this.control()?.fieldState.errors()[0];
    return error
      ? mimiErrorText(error, this.messages)
      : mimiErrorText({ kind: 'default', params: {} }, this.messages);
  });

  protected readonly classes = computed(() =>
    cn(
      // La etiqueta (la de label="…" o la tuya) se pone roja con error.
      'flex flex-col gap-1.5 [&[data-invalid]>label]:text-destructive',
      this.userClass(),
    ),
  );

  protected readonly labelClasses = 'text-sm font-medium';

  constructor() {
    // Conecta el control: id, etiquetas propias sin `for` y aria-describedby del mensaje.
    afterRenderEffect(() => {
      const control = this.control();
      if (!control) return;
      const element = control.controlElement;
      if (!element.id) element.id = `${this.baseId}-control`;
      this.controlId.set(element.id);

      for (const label of Array.from(this.host.querySelectorAll(':scope > label'))) {
        if (!label.hasAttribute('for')) label.setAttribute('for', element.id);
      }

      const describedBy = (element.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean);
      if (!describedBy.includes(this.errorId)) {
        element.setAttribute('aria-describedby', [...describedBy, this.errorId].join(' '));
      }
    });
  }
}

/** Todas las piezas de FormField, para importarlas juntas. */
export const MimiFormFieldImports = [MimiFormField, MimiFormError] as const;
