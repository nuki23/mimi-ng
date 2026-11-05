import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import {
  MIMI_FIELD_CONTROL,
  injectFieldState,
  type MimiFieldControl,
} from '@/components/ui/utils/field-state';

/*
 * Input OTP (docs/design/Mimi F3 Slider OTP Numero Mascara.dc.html, «5 · Input OTP»; prefijo de
 * tokens `otp`, spec 13). **Un solo `<input>` real**, transparente y encima de las casillas
 * (decidido por defecto en la G2.5, como el diseño): el lector lee un campo con el código entero,
 * y pegar, borrar y el autocompletado del SMS (`autocomplete="one-time-code"`) son los nativos.
 * Las casillas son `aria-hidden`.
 */

const BOX_BASE =
  'relative flex shrink-0 items-center justify-center border font-semibold tabular-nums text-foreground mimi-transition w-[var(--mimi-otp-width,46px)] h-[var(--mimi-otp-height,54px)] rounded-[var(--mimi-otp-radius,var(--mimi-radius,0.75rem))] text-[length:var(--mimi-otp-font-size,22px)] bg-[color:var(--mimi-otp-bg,var(--mimi-input-background))]';
/** Borde y anillo de cada casilla según el estado (elegidos en TypeScript: menos CSS global). */
const BOX_STATE = {
  idle: 'border-[color:var(--mimi-otp-border,var(--mimi-input))]',
  active: 'border-ring ring-3 ring-ring-soft',
  success: 'border-success ring-3 ring-success-ring',
  error: 'border-destructive ring-3 ring-destructive-ring',
} as const;

/**
 * Input OTP:
 *
 * ```html
 * <mimi-input-otp aria-label="Código de verificación" [length]="6" [separatorAfter]="3"
 *   formControlName="code" />
 * ```
 *
 * Implementa `FormValueControl<string>`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]`. El valor son los caracteres escritos, sin espacios ni guiones.
 */
@Component({
  selector: 'mimi-input-otp',
  template: `
    @for (box of boxes(); track $index) {
      @if (box.separator) {
        <span
          aria-hidden="true"
          data-slot="separator"
          class="h-0.5 w-3 shrink-0 rounded-[2px] bg-[color:var(--mimi-otp-separator,var(--mimi-border))]"
        ></span>
      }
      <span
        aria-hidden="true"
        data-slot="box"
        [class]="box.classes"
        [attr.data-active]="box.active ? '' : null"
      >
        {{ box.char }}
        @if (box.caret) {
          <span
            data-slot="caret"
            class="h-[22px] w-0.5 rounded-[1px] bg-[color:var(--mimi-otp-caret,var(--mimi-foreground))] animate-[mimi-caret_1s_steps(1)_infinite] motion-reduce:animate-none"
          ></span>
        }
      </span>
    }
    <input
      #field
      type="text"
      class="absolute inset-0 h-full w-full cursor-text border-0 bg-transparent p-0 text-base text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
      [id]="controlId()"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [attr.maxlength]="safeLength()"
      [attr.inputmode]="alphanumeric() ? 'text' : 'numeric'"
      [attr.autocomplete]="autocomplete()"
      [attr.autocapitalize]="alphanumeric() ? 'characters' : null"
      [attr.spellcheck]="false"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-required]="required() || null"
      (input)="onInput()"
      (focus)="focused.set(true)"
      (blur)="focused.set(false); touch.emit()"
    />
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'state()',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-success]': 'success() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.aria-describedby]': 'null',
    '[attr.id]': 'null',
  },
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiInputOtp }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiInputOtp implements FormValueControl<string>, MimiFieldControl {
  /** El código: solo dígitos (o letras y dígitos con `alphanumeric`). */
  readonly value = model('');
  /** Cuántas casillas (6 en el diseño). */
  readonly length = input(6, { transform: numberAttribute });
  /** Después de qué casilla va el guion (3 en el diseño). Sin él, no hay guion. */
  readonly separatorAfter = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) =>
      v === null || v === undefined || v === '' ? undefined : numberAttribute(v),
  });
  /** Letras y dígitos (algunos códigos los tienen). Por defecto, solo dígitos. */
  readonly alphanumeric = input(false, { transform: booleanAttribute });
  /** El código se verificó: borde y anillo `success` (como «Código verificado.» del diseño). */
  readonly success = input(false, { transform: booleanAttribute });
  /** `one-time-code` por defecto: el sistema propone el código del SMS. */
  readonly autocomplete = input('one-time-code');
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
  /** Clases de la fila de casillas, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Se emite al salir del campo: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private static nextId = 0;
  private readonly baseId = `mimi-input-otp-${MimiInputOtp.nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));
  protected readonly focused = signal(false);

  protected readonly safeLength = computed(() => {
    const n = Math.floor(this.length());
    return Number.isFinite(n) && n > 0 ? n : 6;
  });
  private readonly chars = computed(() => this.clean(this.value() ?? ''));
  protected readonly state = computed(() => {
    const n = this.chars().length;
    return n === 0 ? 'empty' : n >= this.safeLength() ? 'complete' : 'partial';
  });

  protected readonly boxes = computed(() => {
    const chars = this.chars();
    const length = this.safeLength();
    const after = this.separatorAfter();
    // La casilla activa: la siguiente a llenar (la última si está completo), con el foco.
    const activeIndex = Math.min(chars.length, length - 1);
    const status = this.showInvalid() ? 'error' : this.success() ? 'success' : null;
    return Array.from({ length }, (_, i) => {
      const active = this.focused() && !this.disabled() && i === activeIndex && !status;
      return {
        char: chars[i] ?? '',
        separator: after !== undefined && after > 0 && after < length && i === after,
        active,
        caret: active && !chars[i],
        classes: cn(BOX_BASE, BOX_STATE[status ?? (active ? 'active' : 'idle')]),
      };
    });
  });

  protected readonly classes = computed(() =>
    cn(
      'relative inline-flex items-center gap-[var(--mimi-otp-gap,8px)] align-middle font-sans',
      'data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
      // Error: la fila se sacude una vez (sin movimiento con «reducir movimiento»).
      'data-[invalid]:animate-[mimi-shake_.4s] motion-reduce:data-[invalid]:animate-none',
      this.userClass(),
    ),
  );

  /** Solo los caracteres válidos, hasta la longitud (quita espacios y guiones de lo pegado). */
  private clean(text: string): string {
    const pattern = this.alphanumeric() ? /[^\p{L}\p{N}]/gu : /\D/g;
    return text.replace(pattern, '').slice(0, this.safeLength());
  }

  protected onInput(): void {
    const el = this.field().nativeElement;
    const clean = this.clean(el.value);
    if (el.value !== clean) el.value = clean;
    if (clean !== this.value()) this.value.set(clean);
  }
}
