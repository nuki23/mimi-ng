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
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';

let nextId = 0;

/**
 * Interruptor encendido/apagado (docs/design/Mimi Componentes.dc.html, sección 7):
 * `<mimi-switch [(checked)]="avion">Modo avión</mimi-switch>`.
 *
 * Por dentro es un `<button type="button" role="switch">` y no un `<input type="checkbox">`:
 * el pulgar del diseño no se puede dibujar de forma fiable con pseudoelementos sobre un input
 * en todos los navegadores. El texto va en un `<label for>` que también lo alterna.
 *
 * Implementa `FormCheckboxControl`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]` sin adaptador (spec, sección 8).
 */
@Component({
  selector: 'mimi-switch',
  // mimi-form-field lo encuentra por este token para mostrar el mensaje de error.
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiSwitch }],
  template: `
    <button
      #control
      type="button"
      role="switch"
      [id]="controlId()"
      [class]="trackClasses"
      [disabled]="disabled()"
      [attr.aria-checked]="checked()"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-required]="required() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.data-state]="state()"
      (click)="toggle()"
      (blur)="touch.emit()"
    >
      <span [class]="thumbClasses"></span>
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
export class MimiSwitch implements FormCheckboxControl, MimiFieldControl {
  /** Encendido o apagado. Con `[(checked)]` o un formulario. */
  readonly checked = model(false);
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

  /** Estado del formulario, con los errores, para el mensaje de mimi-form-field. */
  readonly fieldState = injectFieldState();

  /** El botón interno: mimi-form-field le agrega el aria-describedby del mensaje. */
  get controlElement(): HTMLElement {
    return this.control().nativeElement;
  }
  private readonly autoId = `mimi-switch-${nextId++}`;

  protected readonly controlId = computed(() => this.id() || this.autoId);
  protected readonly state = computed(() => (this.checked() ? 'checked' : 'unchecked'));
  /** Error visible (inválido y tocado o modificado). Lo lee también mimi-form-field. */
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly classes = computed(() =>
    cn('inline-flex items-center gap-2.5 text-sm', this.userClass()),
  );

  // Pista: 36×20 (--mimi-switch-width/-height), 2px de padding. Encendida: primary con su sombra.
  protected readonly trackClasses = cn(
    'peer group inline-flex h-[var(--mimi-switch-height,1.25rem)] w-[var(--mimi-switch-width,2.25rem)] shrink-0 items-center rounded-full bg-[color:var(--mimi-switch-track-off,var(--mimi-switch-off))] p-0.5',
    'mimi-transition active:scale-(--mimi-press-scale-sm)',
    'data-[state=checked]:bg-[color:var(--mimi-switch-track-on,var(--mimi-primary))] data-[state=checked]:shadow-primary disabled:shadow-none',
    buttonFocusStyles,
    controlDisabledStyles,
  );

  // Pulgar: alto de la pista menos el padding (16px); al encender se desplaza ancho − alto (16px).
  protected readonly thumbClasses = cn(
    'pointer-events-none block size-[calc(var(--mimi-switch-height,1.25rem)_-_0.25rem)] rounded-full bg-[color:var(--mimi-switch-thumb,var(--mimi-background))] shadow-thumb mimi-transition',
    'group-data-[state=checked]:translate-x-[calc(var(--mimi-switch-width,2.25rem)_-_var(--mimi-switch-height,1.25rem))] group-data-[state=checked]:bg-primary-foreground',
    'group-disabled:shadow-none',
  );

  /** Alterna el estado (no hace nada si está deshabilitado). */
  toggle(): void {
    if (this.disabled()) return;
    this.checked.update((value) => !value);
  }

  /** Enfoca el botón. Lo usa Signal Forms para llevar el foco al campo con error. */
  focus(options?: FocusOptions): void {
    this.control().nativeElement.focus(options);
  }
}
