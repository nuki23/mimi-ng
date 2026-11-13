import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import { fieldBoxStyles, fieldButtonHoverStyles } from '@/components/ui/utils/field-styles';
import { MimiSized } from '@/components/ui/utils/size';
import {
  MIMI_FIELD_CONTROL,
  injectFieldState,
  type MimiFieldControl,
} from '@/components/ui/utils/field-state';
import { MIMI_NUMBER_INPUT_TEXT } from './number-input-texts';

/*
 * Number Input (docs/design/Mimi F3 Slider OTP Numero Mascara.dc.html, «6 · Number Input»;
 * prefijo de tokens `number`, spec 13). Patrón «Spinbutton» de la APG con un `<input>` de texto
 * (`role="spinbutton"`, `inputmode="decimal"`): admite el texto formateado con
 * `Intl.NumberFormat`, que un `type="number"` no permite.
 *
 * El texto se escribe libre y se interpreta al salir del campo (o con Enter), con los
 * separadores del idioma; mientras se escribe no se reformatea (no se mueve el cursor).
 */

const toNumber = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** Decimales de un número (para redondear al paso sin errores de coma flotante). */
const decimals = (n: number): number => {
  const text = String(n);
  if (text.includes('e-')) return Number(text.split('e-')[1]);
  return text.includes('.') ? text.split('.')[1].length : 0;
};

const BOX_CLASSES = cn(
  'relative flex w-full min-w-0 items-center gap-0.5 font-sans text-foreground mimi-transition',
  'h-[var(--mimi-number-height,var(--mimi-size-height,var(--mimi-control-height,2.5rem)))] rounded-[var(--mimi-number-radius,var(--mimi-radius,0.75rem))] px-[var(--mimi-number-px,4px)]',
  // Borde, hover, foco, error y deshabilitado: los de Input, con sus tokens (utils/control-styles).
  fieldBoxStyles,
);

const INPUT_CLASSES =
  'h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-center text-sm font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed';

const BUTTON_CLASSES = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 mimi-transition',
  fieldButtonHoverStyles,
  'size-[var(--mimi-number-button-size,30px)] rounded-[var(--mimi-number-button-radius,var(--mimi-radius-sm))]',
  '[&_svg]:size-[15px] [&_svg]:shrink-0',
  'not-aria-disabled:hover:bg-[color:var(--mimi-number-button-hover,var(--mimi-accent))] not-aria-disabled:active:scale-(--mimi-press-scale-sm)',
  'aria-disabled:cursor-not-allowed aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
);

/** Mantener pulsado − o +: primer repetición a los 400 ms, después cada 80 ms. */
const REPEAT_DELAY = 400;
const REPEAT_EVERY = 80;

/**
 * Number Input:
 *
 * ```html
 * <mimi-number-input aria-label="Cantidad" [(value)]="cantidad" [min]="0" [max]="10" />
 * <mimi-number-input aria-label="Precio" [(value)]="precio" [step]="50"
 *   [format]="{ style: 'currency', currency: 'MXN' }" locale="es-MX" />
 * ```
 *
 * Implementa `FormValueControl<number | null>`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]`. Vacío es `null`. Un valor fuera de rango que llega de fuera se pinta acotado sin
 * reescribir el modelo.
 */
@Component({
  selector: 'mimi-number-input',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    <button
      type="button"
      tabindex="-1"
      data-slot="decrement"
      [class]="buttonClasses"
      [attr.aria-label]="text.decrement(labelText())"
      [attr.aria-disabled]="!canDecrement() || null"
      [attr.aria-controls]="controlId()"
      (pointerdown)="press($event, -1)"
      (click)="tap(-1)"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- Lucide minus (ISC) -->
        <path d="M5 12h14" />
      </svg>
    </button>
    <input
      #field
      type="text"
      role="spinbutton"
      inputmode="decimal"
      autocomplete="off"
      [class]="inputClasses"
      [id]="controlId()"
      [value]="display()"
      [disabled]="disabled()"
      [readOnly]="readonly()"
      [attr.placeholder]="placeholder() || null"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-valuenow]="shown()"
      [attr.aria-valuemin]="min() ?? null"
      [attr.aria-valuemax]="max() ?? null"
      [attr.aria-valuetext]="shown() === null ? null : formatted(shown()!)"
      [attr.aria-invalid]="showInvalid() || null"
      [attr.aria-required]="required() || null"
      (focus)="startEditing()"
      (input)="draft.set(field.value)"
      (blur)="commit()"
      (keydown)="onKeydown($event)"
    />
    <button
      type="button"
      tabindex="-1"
      data-slot="increment"
      [class]="buttonClasses"
      [attr.aria-label]="text.increment(labelText())"
      [attr.aria-disabled]="!canIncrement() || null"
      [attr.aria-controls]="controlId()"
      (pointerdown)="press($event, 1)"
      (click)="tap(1)"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- Lucide plus (ISC) -->
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </button>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'editing() ? "editing" : "idle"',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    // El nombre va al input de dentro: en el anfitrión no lo lee nadie.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.id]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiNumberInput }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiNumberInput implements FormValueControl<number | null>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly appLocale = inject(LOCALE_ID);
  protected readonly text = inject(MIMI_NUMBER_INPUT_TEXT);

  /** El número, o `null` si está vacío. Con `[(value)]` o un formulario. */
  readonly value = model<number | null>(null);
  readonly min = input<number | undefined, unknown>(undefined, { transform: toNumber });
  readonly max = input<number | undefined, unknown>(undefined, { transform: toNumber });
  /** Paso de ↑/↓ y de los botones; al salir del campo, el valor se redondea a él. */
  readonly step = input<number, unknown>(1, {
    transform: (v: unknown) => {
      const n = toNumber(v);
      return n !== undefined && n > 0 ? n : 1;
    },
  });
  /** Opciones de `Intl.NumberFormat` (moneda, decimales, unidad…). */
  readonly format = input<Intl.NumberFormatOptions | undefined>(undefined);
  /** Idioma del formato y de la lectura. Por defecto, el `LOCALE_ID` de Angular. */
  readonly locale = input<string | undefined>(undefined);
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  /** id del input, para una etiqueta externa (`<label for>`). */
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases de la caja, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Se emite cuando el foco sale de la caja entera: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Estado del formulario, para el mensaje de mimi-form-field. */
  readonly fieldState = injectFieldState();
  /** El input: mimi-form-field le agrega el aria-describedby del mensaje. */
  get controlElement(): HTMLElement {
    return this.field().nativeElement;
  }

  private static nextId = 0;
  private readonly baseId = `mimi-number-input-${MimiNumberInput.nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  /** Con el foco: el texto que se escribe (sin formato). */
  protected readonly editing = signal(false);
  protected readonly draft = signal('');

  private readonly localeId = computed(() => this.locale() || this.appLocale);
  private readonly formatter = computed(
    () => new Intl.NumberFormat(this.localeId(), this.format()),
  );
  /** Para editar: el número con el decimal del idioma, sin separador de miles. */
  private readonly plain = computed(
    () => new Intl.NumberFormat(this.localeId(), { useGrouping: false, maximumFractionDigits: 20 }),
  );
  /** Separadores del idioma, para leer lo que se escribe. */
  private readonly separators = computed(() => {
    const parts = new Intl.NumberFormat(this.localeId()).formatToParts(-12345.6);
    return {
      group: parts.find((p) => p.type === 'group')?.value ?? ',',
      decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    };
  });

  /** El valor que se pinta: acotado, sin tocar el modelo. */
  protected readonly shown = computed(() => {
    const value = this.value();
    return value === null || !Number.isFinite(value) ? null : this.clamp(value);
  });
  protected readonly display = computed(() => {
    if (this.editing()) return this.draft();
    const shown = this.shown();
    return shown === null ? '' : this.formatted(shown);
  });
  protected readonly canDecrement = computed(() => this.canStep(-1));
  protected readonly canIncrement = computed(() => this.canStep(1));
  /** Para «Disminuir {etiqueta}»: el aria-label o el texto de la etiqueta enlazada. */
  protected readonly labelText = computed(() => {
    const label = this.ariaLabel()?.trim();
    if (label) return label;
    const ids = this.ariaLabelledby()?.trim();
    if (!ids) return '';
    const doc = this.host.ownerDocument;
    return ids
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ')
      .trim();
  });

  protected readonly classes = computed(() => cn(BOX_CLASSES, this.userClass()));
  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly buttonClasses = BUTTON_CLASSES;

  private repeatTimer: ReturnType<typeof setTimeout> | undefined;
  private pointerStepped = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopRepeat());
  }

  /** Uso interno: el número con el formato del usuario. */
  formatted(value: number): string {
    return this.formatter().format(value);
  }

  /** Lee un texto con los separadores del idioma («1.250,5» en es-ES → 1250.5). */
  parse(text: string): number | null {
    // Vacío es null; un texto sin cifras no es un número (se descarta al salir).
    if (!text.trim()) return null;
    if (!/\d/.test(text)) return NaN;
    const { group, decimal } = this.separators();
    let clean = text.replace(/\s/g, '').split(group).join('');
    // Algunos idiomas usan un espacio fino o duro como separador de miles.
    if (/\s/.test(group)) clean = clean.replace(/[  ]/g, '');
    clean = clean.split(decimal).join('.').replace(/[−–]/g, '-');
    clean = clean.replace(/[^\d.-]/g, '');
    if (clean === '' || clean === '-' || clean === '.') return null;
    const n = Number(clean);
    return Number.isFinite(n) ? n : NaN;
  }

  protected startEditing(): void {
    if (this.editing()) return;
    const shown = this.shown();
    this.draft.set(shown === null ? '' : this.plain().format(shown));
    this.editing.set(true);
  }

  /** Lee el texto, redondea al paso y acota. Un texto que no es un número se descarta. */
  protected commit(): void {
    if (!this.editing()) return;
    const parsed = this.parse(this.draft());
    this.editing.set(false);
    if (this.readonly() || this.disabled()) return;
    if (parsed === null) {
      if (this.value() !== null) this.value.set(null);
      return;
    }
    if (Number.isNaN(parsed)) return;
    const next = this.clamp(this.roundToStep(parsed));
    if (next !== this.value()) this.value.set(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = this.step();
    const actions: Record<string, () => void> = {
      ArrowUp: () => this.stepBy(step),
      ArrowDown: () => this.stepBy(-step),
      PageUp: () => this.stepBy(step * 10),
      PageDown: () => this.stepBy(-step * 10),
      Home: () => this.min() !== undefined && this.setFromKeyboard(this.min()!),
      End: () => this.max() !== undefined && this.setFromKeyboard(this.max()!),
      Enter: () => {
        this.commit();
        this.startEditing();
      },
    };
    const action = actions[event.key];
    if (!action) return;
    // Inicio y Fin sin límite son del campo de texto (mover el cursor).
    if (
      (event.key === 'Home' && this.min() === undefined) ||
      (event.key === 'End' && this.max() === undefined)
    ) {
      return;
    }
    event.preventDefault();
    action();
  }

  /** Puntero en − o +: un paso ahora y, si se mantiene, repetir. El foco no se mueve. */
  protected press(event: PointerEvent, direction: 1 | -1): void {
    event.preventDefault();
    if (event.button !== 0 || !this.canStep(direction)) return;
    this.pointerStepped = true;
    this.stepBy(direction * this.step());
    this.stopRepeat();
    const target = event.currentTarget as HTMLElement;
    const stop = () => this.stopRepeat();
    for (const type of ['pointerup', 'pointerleave', 'pointercancel']) {
      target.addEventListener(type, stop, { once: true });
    }
    const repeat = () => {
      if (!this.canStep(direction)) return this.stopRepeat();
      this.stepBy(direction * this.step());
      this.repeatTimer = setTimeout(repeat, REPEAT_EVERY);
    };
    this.repeatTimer = setTimeout(repeat, REPEAT_DELAY);
  }

  /** Clic sin puntero (un lector de pantalla): un paso. Tras un `pointerdown`, ya se contó. */
  protected tap(direction: 1 | -1): void {
    if (this.pointerStepped) {
      this.pointerStepped = false;
      return;
    }
    if (this.canStep(direction)) this.stepBy(direction * this.step());
  }

  /** El foco salió de la caja entera (input y botones). */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.host.contains(next)) return;
    this.touch.emit();
  }

  private stopRepeat(): void {
    clearTimeout(this.repeatTimer);
    this.repeatTimer = undefined;
  }

  private canStep(direction: 1 | -1): boolean {
    if (this.disabled() || this.readonly()) return false;
    const shown = this.shown();
    if (shown === null) return true;
    const limit = direction > 0 ? this.max() : this.min();
    return limit === undefined || (direction > 0 ? shown < limit : shown > limit);
  }

  /** Suma `delta` al valor (o al texto que se está escribiendo), acotado. */
  private stepBy(delta: number): void {
    if (this.disabled() || this.readonly()) return;
    const current = this.editing() ? this.parse(this.draft()) : this.shown();
    // Vacío (o un texto que no es un número): el primer paso lleva a `min` (o a 0).
    const empty = current === null || Number.isNaN(current);
    this.setFromKeyboard(empty ? (this.min() ?? 0) : this.roundToStep(current) + delta);
  }

  private setFromKeyboard(value: number): void {
    const next = this.clamp(this.fix(value));
    if (next !== this.value()) this.value.set(next);
    if (this.editing()) this.draft.set(this.plain().format(next));
  }

  private clamp(value: number): number {
    const min = this.min();
    const max = this.max();
    let v = value;
    if (max !== undefined) v = Math.min(max, v);
    if (min !== undefined) v = Math.max(min, v);
    return v;
  }

  /** Al múltiplo del paso más cercano, contado desde `min` (o 0). */
  private roundToStep(value: number): number {
    const step = this.step();
    const base = this.min() ?? 0;
    return this.fix(base + Math.round((value - base) / step) * step);
  }

  /** Quita el error de coma flotante: los decimales del paso, de `min` y de `max`. */
  private fix(value: number): number {
    const places = Math.max(
      decimals(this.step()),
      decimals(this.min() ?? 0),
      decimals(this.max() ?? 0),
    );
    return Number(value.toFixed(Math.min(places, 20)));
  }
}
