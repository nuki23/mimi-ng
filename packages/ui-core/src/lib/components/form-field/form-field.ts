import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_FIELD_CONTROL } from '@/components/ui/utils/field-state';
import { MIMI_ERROR_MESSAGES, type MimiErrorMessages, mimiErrorText } from './error-messages';
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
      <label [attr.for]="controlId()" [class]="labelClasses"
        >{{ label() }}
        @if (required()) {
          <span data-slot="required" aria-hidden="true" class="text-destructive"> *</span>
        }
      </label>
    }
    @if (description()) {
      <p data-slot="description" [id]="descriptionId" [class]="helpClasses">{{ description() }}</p>
    }
    <ng-content />
    @if (hint()) {
      <p data-slot="hint" [id]="hintId" [class]="helpClasses">{{ hint() }}</p>
    }
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
  /**
   * Mensajes de error de este campo, por clave (`required`, `email`, `minlength`…): un texto o una
   * función con los datos del error. Lo que no esté sigue en `provideMimiErrorMessages`. Sirve en
   * los tres sistemas de formularios; en Signal Forms y Reactive, el `message` del propio
   * validador gana (`withMessage`).
   */
  readonly errors = input<MimiErrorMessages>();
  /** Texto de ayuda entre la etiqueta y el control (qué se pide). Va en el `aria-describedby`. */
  readonly description = input<string>();
  /** Texto de ayuda debajo del control (formato, límites). Va en el `aria-describedby`. */
  readonly hint = input<string>();
  /**
   * Campo obligatorio: asterisco en la etiqueta (los lectores no lo leen) y `aria-required` en el
   * control. La validación sigue siendo la de tu formulario.
   */
  readonly required = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly messages = inject(MIMI_ERROR_MESSAGES);
  private readonly control = contentChild(MIMI_FIELD_CONTROL, { descendants: true });
  protected readonly ownError = contentChild(MimiFormError, { descendants: true });

  private readonly baseId = `mimi-form-field-${nextId++}`;
  readonly errorId = `${this.baseId}-error`;
  protected readonly descriptionId = `${this.baseId}-description`;
  protected readonly hintId = `${this.baseId}-hint`;
  protected readonly helpClasses = 'text-[13px] text-muted-foreground';
  /** id del control (el suyo o el que le asigna el form-field). */
  protected readonly controlId = signal<string | null>(null);

  readonly showError = computed(() => this.control()?.showInvalid() ?? false);
  protected readonly disabled = computed(() => this.control()?.fieldState.disabled() ?? false);
  readonly message = computed(() => {
    const error = this.control()?.fieldState.errors()[0];
    if (!error) return mimiErrorText({ kind: 'default', params: {} }, this.messages);
    // Orden (PD-3): <mimi-form-error> explícito > `message` del validador > `errors` del campo >
    // provideMimiErrorMessages > predeterminado.
    if (error.message) return error.message;
    const local = this.errors();
    if (local) {
      const entry = Object.entries(local).find(([key]) => key.toLowerCase() === error.kind)?.[1];
      if (entry !== undefined) return typeof entry === 'function' ? entry(error.params) : entry;
    }
    return mimiErrorText(error, this.messages);
  });

  protected readonly classes = computed(() =>
    cn(
      // La etiqueta (la de label="…" o la tuya) se pone roja con error.
      'flex flex-col gap-[var(--mimi-field-gap,0.375rem)] [&[data-invalid]>label]:text-[color:var(--mimi-field-error,var(--mimi-destructive))]',
      this.userClass(),
    ),
  );

  protected readonly labelClasses =
    'text-[length:var(--mimi-field-label-size,0.875rem)] leading-[calc(1.25/0.875)] font-[weight:var(--mimi-field-label-weight,500)]';

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
      // La descripción y la ayuda, antes del error; cada id una sola vez.
      const wanted = [
        this.description() ? this.descriptionId : null,
        this.hint() ? this.hintId : null,
        this.errorId,
      ].filter((id): id is string => !!id);
      // Los ids de la descripción y la ayuda que ya no existen se quitan (no quedan colgando).
      const ours = [this.descriptionId, this.hintId];
      const kept = describedBy.filter((id) => !ours.includes(id) || wanted.includes(id));
      const missing = wanted.filter((id) => !kept.includes(id));
      if (missing.length || kept.length !== describedBy.length) {
        element.setAttribute('aria-describedby', [...kept, ...missing].join(' '));
      }
      if (this.required() && !element.hasAttribute('aria-required')) {
        element.setAttribute('aria-required', 'true');
      }
    });
  }
}

/** Todas las piezas de FormField, para importarlas juntas. */
export const MimiFormFieldImports = [MimiFormField, MimiFormError] as const;
