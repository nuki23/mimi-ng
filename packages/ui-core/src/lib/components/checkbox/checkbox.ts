import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles, controlDisabledStyles } from '@/components/ui/utils/control-styles';

let nextId = 0;

/**
 * Casilla de verificación (docs/design/Mimi Componentes.dc.html, sección 7):
 * `<mimi-checkbox [(checked)]="recordarme">Recordarme</mimi-checkbox>`.
 *
 * Por dentro es un `<button type="button" role="checkbox">` y no un `<input type="checkbox">`:
 * el check del diseño no se puede dibujar de forma fiable con pseudoelementos sobre un input en
 * todos los navegadores. Se alterna con Espacio (Enter no hace nada, patrón WAI) y con clic en
 * el texto, que va en un `<label for>`.
 *
 * Implementa `FormCheckboxControl`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]` sin adaptador (spec, sección 8).
 */
@Component({
  selector: 'mimi-checkbox',
  template: `
    <button
      #control
      type="button"
      role="checkbox"
      [id]="controlId()"
      [class]="boxClasses"
      [disabled]="disabled()"
      [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
      [attr.aria-invalid]="showError() || null"
      [attr.aria-required]="required() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.data-state]="state()"
      (click)="toggle()"
      (keydown.enter)="$event.preventDefault()"
      (blur)="touch.emit()"
    >
      @switch (state()) {
        @case ('checked') {
          <!-- Lucide check -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-3"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
        @case ('indeterminate') {
          <!-- Lucide minus -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-3"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
          </svg>
        }
      }
    </button>
    <label
      [for]="controlId()"
      class="cursor-pointer empty:hidden peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      ><ng-content
    /></label>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': 'disabled() || null',
    // id y aria-* se pasan al botón: fuera del anfitrión, para no duplicarlos.
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCheckbox implements FormCheckboxControl {
  /** Marcada o no. Con `[(checked)]` o un formulario. */
  readonly checked = model(false);
  /** Estado mixto ("algunos"): gana a `checked`. Al hacer clic se marca y deja de ser mixto. */
  readonly indeterminate = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del botón, para una etiqueta externa (`<label for>`). */
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });

  /** Se emite al perder el foco: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly control = viewChild.required<ElementRef<HTMLButtonElement>>('control');
  private readonly autoId = `mimi-checkbox-${nextId++}`;

  protected readonly controlId = computed(() => this.id() || this.autoId);
  protected readonly state = computed(() =>
    this.indeterminate() ? 'indeterminate' : this.checked() ? 'checked' : 'unchecked',
  );
  protected readonly showError = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly classes = computed(() =>
    cn('inline-flex items-center gap-2.5 text-sm', this.userClass()),
  );

  // Caja de 16px. Marcada o mixta: primary con su sombra. Foco: borde ring (sin marcar) y contorno.
  protected readonly boxClasses = cn(
    'peer inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-input-background text-primary-foreground',
    'mimi-transition active:scale-(--mimi-press-scale-sm)',
    'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:shadow-primary',
    'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:shadow-primary',
    'data-[state=unchecked]:focus-visible:border-ring data-[state=unchecked]:aria-invalid:border-destructive',
    'disabled:shadow-none',
    buttonFocusStyles,
    controlDisabledStyles,
  );

  /** Alterna el estado (no hace nada si está deshabilitada). Desde mixta, pasa a marcada. */
  toggle(): void {
    if (this.disabled()) return;
    if (this.indeterminate()) {
      this.indeterminate.set(false);
      this.checked.set(true);
      return;
    }
    this.checked.update((value) => !value);
  }

  /** Enfoca el botón. Lo usa Signal Forms para llevar el foco al campo con error. */
  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
