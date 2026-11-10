import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { type FormValueControl, transformedValue } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import {
  MIMI_FIELD_CONTROL,
  injectFieldState,
  type MimiFieldControl,
} from '@/components/ui/utils/field-state';

/*
 * Input Mask (docs/design/Mimi F3 Slider OTP Numero Mascara.dc.html, «7 · Input Mask»; prefijo
 * de tokens `mask`, spec 13). Control propio con `FormValueControl<string>`: el modelo guarda
 * **solo los dígitos** («5512345678») y el campo muestra la máscara («(55) 1234 5678»), como el
 * diseño (decidido por defecto en la G2.4, opción (b)). Usa `transformedValue()` de Signal Forms.
 *
 * Sintaxis: `0` es un dígito; cualquier otro carácter es un literal.
 */

/** Cuántos dígitos caben en la máscara. */
export function mimiMaskLength(mask: string): number {
  return [...mask].filter((c) => c === '0').length;
}

/**
 * Aplica la máscara a unos dígitos. Un literal se escribe solo si después viene un dígito
 * («(5», no «(5) »): así borrar hacia atrás no se traba en los literales.
 */
export function mimiApplyMask(mask: string, digits: string): string {
  let out = '';
  let i = 0;
  for (const slot of mask) {
    if (i >= digits.length) break;
    if (slot === '0') out += digits[i++];
    else out += slot;
  }
  return out;
}

/** Los dígitos de un texto (con o sin literales), hasta lo que cabe en la máscara. */
export function mimiUnmask(mask: string, text: string): string {
  return (text.match(/\d/g) ?? []).join('').slice(0, mimiMaskLength(mask));
}

/** Posición en el texto con máscara justo después del dígito número `count` (0: al principio). */
function caretAfterDigits(masked: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i]) && ++seen === count) return i + 1;
  }
  return masked.length;
}

/**
 * La caja (como Input: alto, radio, borde, hover, foco y error) con el input sin su propia caja
 * adentro, para poder poner el prefijo y los íconos al lado (G2.4b).
 */
const BOX_CLASSES = cn(
  'relative flex w-full min-w-0 cursor-text items-center gap-[var(--mimi-mask-gap,8px)] px-3 font-sans text-foreground mimi-transition',
  'h-[var(--mimi-input-h,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))] rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))]',
  'border border-input bg-input-background',
  'not-data-[disabled]:hover:border-input-hover',
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring-soft',
  'data-[invalid]:border-destructive data-[invalid]:focus-within:border-destructive data-[invalid]:focus-within:ring-destructive-ring',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

/** El texto: 14px, cifras tabulares y un poco de espacio, como el diseño (el marcador igual). */
const TEXT = 'text-sm tabular-nums tracking-[.02em] whitespace-pre';
const INPUT_CLASSES = cn(
  'relative h-full w-full min-w-0 border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
  TEXT,
);
const GHOST_CLASSES = cn('pointer-events-none absolute inset-0 flex items-center', TEXT);

/** Prefijo fijo dentro de la caja (`+52`): un chip `muted`. */
@Directive({
  selector: '[mimiMaskPrefix]',
  host: { 'data-slot': 'prefix', '[class]': 'classes()' },
})
export class MimiMaskPrefix {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'inline-flex shrink-0 items-center gap-1.5 -ms-1.5 px-2 text-[13px] font-semibold text-foreground',
      'h-[var(--mimi-mask-prefix-height,26px)] rounded-[var(--mimi-mask-prefix-radius,var(--mimi-radius-sm))] bg-[color:var(--mimi-mask-prefix-bg,var(--mimi-muted))]',
      this.userClass(),
    ),
  );
}

/** Algo al principio de la caja (un ícono): `muted-foreground`, íconos de 16px. */
@Directive({
  selector: '[mimiMaskStart]',
  host: { 'data-slot': 'start', '[class]': 'classes()' },
})
export class MimiMaskStart {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('inline-flex shrink-0 items-center text-muted-foreground [&_svg]:size-4', this.userClass()),
  );
}

/** Algo al final de la caja (la marca de la tarjeta, un ícono de válido). */
@Directive({
  selector: '[mimiMaskEnd]',
  host: { 'data-slot': 'end', '[class]': 'classes()' },
})
export class MimiMaskEnd {
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('inline-flex shrink-0 items-center [&_svg]:size-4', this.userClass()),
  );
}

/**
 * Input Mask:
 *
 * ```html
 * <mimi-input-mask mask="(00) 0000 0000" autocomplete="tel-national" aria-label="Teléfono"
 *   formControlName="phone" />   <!-- el valor: '5512345678' -->
 * ```
 *
 * Implementa `FormValueControl<string>`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]`. Con Signal Forms, una máscara incompleta deja el campo inválido (error `mask`);
 * con Reactive Forms y `ngModel`, agrega un validador (por ejemplo, `Validators.minLength`).
 */
@Component({
  selector: 'mimi-input-mask',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    <ng-content select="[mimiMaskPrefix], [mimiMaskStart]" />
    <span class="relative flex h-full min-w-0 flex-1 items-center">
      @if (ghostRest()) {
        <!-- El marcador de lo que falta: debajo del texto, con lo escrito transparente. -->
        <span aria-hidden="true" data-slot="ghost" [class]="ghostClasses"
          ><span class="text-transparent">{{ raw() }}</span
          ><span
            class="text-[color:var(--mimi-mask-placeholder,var(--mimi-input-placeholder,var(--mimi-muted-foreground)))]"
            >{{ ghostRest() }}</span
          ></span
        >
      }
      <input
        #field
        type="text"
        [class]="inputClasses"
        [id]="controlId()"
        [value]="raw()"
        [disabled]="disabled()"
        [readOnly]="readonly()"
        [attr.inputmode]="inputmode()"
        [attr.autocomplete]="autocomplete() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.maxlength]="mask().length"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="required() || null"
        (input)="onInput()"
        (keydown)="onKeydown($event)"
        (compositionstart)="composing = true"
        (compositionend)="composing = false; onInput()"
        (blur)="touch.emit()"
      />
    </span>
    <ng-content select="[mimiMaskEnd]" />
  `,
  host: {
    '[class]': 'boxClasses()',
    '[attr.data-state]': 'complete() ? "complete" : digits() ? "partial" : "empty"',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'focusField($event)',
    // El nombre y el id van al input de dentro.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.id]': 'null',
  },
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiInputMask }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiInputMask implements FormValueControl<string>, MimiFieldControl {
  /** Solo los dígitos. Con `[(value)]` o un formulario. */
  readonly value = model('');
  /** La máscara: `0` es un dígito; lo demás, literales. Por ejemplo, `(00) 0000 0000`. */
  readonly mask = input.required<string>();
  /** `numeric` por defecto (teclado de números en el móvil). */
  readonly inputmode = input('numeric');
  readonly autocomplete = input<string>();
  readonly placeholder = input('');
  /**
   * Marcador de lo que falta, del largo de la máscara (por ejemplo, `DD/MM/AAAA`): se ve debajo
   * de lo escrito, en el color del placeholder. Decorativo (`aria-hidden`): di el formato con
   * texto en `aria-describedby`.
   */
  readonly ghost = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del input, para un `<label for>`. */
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly ariaDescribedby = input<string>(undefined, { alias: 'aria-describedby' });
  /** Clases de la caja, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Se emite al salir del campo: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Estado del formulario, para mimi-form-field. */
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private static nextId = 0;
  private readonly baseId = `mimi-input-mask-${MimiInputMask.nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  /** Lo que se pinta: el valor con la máscara. Con Signal Forms, una máscara incompleta es un error. */
  protected readonly raw = transformedValue(this.value, {
    parse: (text: string) => {
      const digits = mimiUnmask(this.mask(), text);
      const incomplete = digits.length > 0 && digits.length < mimiMaskLength(this.mask());
      return incomplete ? { value: digits, error: { kind: 'mask' } } : { value: digits };
    },
    format: (digits: string) => mimiApplyMask(this.mask(), mimiUnmask(this.mask(), digits ?? '')),
  });
  protected readonly digits = computed(() => mimiUnmask(this.mask(), this.value() ?? ''));
  protected readonly complete = computed(
    () => this.digits().length === mimiMaskLength(this.mask()),
  );

  /** Lo que falta del marcador: lo que está después de lo escrito. */
  protected readonly ghostRest = computed(() => {
    const ghost = this.ghost();
    return ghost ? ghost.slice(this.raw().length) : '';
  });

  protected readonly boxClasses = computed(() => cn(BOX_CLASSES, this.userClass()));
  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly ghostClasses = GHOST_CLASSES;

  /** Un clic en la caja (el prefijo, el ícono o el relleno) lleva el foco al campo. */
  protected focusField(event: MouseEvent): void {
    const el = this.field().nativeElement;
    if (event.target !== el && !el.disabled) el.focus();
  }

  /** Durante la composición de texto (IME) no se reformatea. */
  protected composing = false;

  /** Reformatea lo escrito o pegado y repone el cursor después del mismo dígito. */
  protected onInput(): void {
    if (this.composing) return;
    const el = this.field().nativeElement;
    const caret = el.selectionStart ?? el.value.length;
    const digitsBefore = (el.value.slice(0, caret).match(/\d/g) ?? []).length;
    this.write(mimiUnmask(this.mask(), el.value), digitsBefore);
  }

  /** Borrar sobre un literal borra el dígito de al lado (si no, el literal vuelve y se traba). */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    const el = this.field().nativeElement;
    const start = el.selectionStart ?? 0;
    if (start !== el.selectionEnd || this.readonly()) return;
    const text = el.value;
    const back = event.key === 'Backspace';
    const neighbor = back ? text[start - 1] : text[start];
    if (neighbor === undefined || /\d/.test(neighbor)) return;
    // Hay un literal pegado al cursor: se salta y se borra el dígito siguiente en esa dirección.
    const before = (text.slice(0, start).match(/\d/g) ?? []).length;
    const digits = mimiUnmask(this.mask(), text);
    const index = back ? before - 1 : before;
    if (index < 0 || index >= digits.length) return;
    event.preventDefault();
    this.write(digits.slice(0, index) + digits.slice(index + 1), back ? before - 1 : before);
  }

  private write(digits: string, digitsBefore: number): void {
    const el = this.field().nativeElement;
    const masked = mimiApplyMask(this.mask(), digits);
    this.raw.set(masked);
    if (el.value !== masked) el.value = masked;
    const caret = caretAfterDigits(masked, Math.min(digitsBefore, digits.length));
    if (el.ownerDocument.activeElement === el) el.setSelectionRange(caret, caret);
  }
}

/** Todas las piezas de Input Mask, para importarlas juntas. */
export const MimiInputMaskImports = [
  MimiInputMask,
  MimiMaskPrefix,
  MimiMaskStart,
  MimiMaskEnd,
] as const;
