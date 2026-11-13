import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MimiSized } from '@/components/ui/utils/size';
import {
  MIMI_FIELD_CONTROL,
  injectFieldState,
  type MimiFieldControl,
} from '@/components/ui/utils/field-state';
import { MIMI_SLIDER_TEXT } from './slider-texts';

/*
 * Slider (docs/design/Mimi F3 Slider OTP Numero Mascara.dc.html, «4 · Slider»; prefijo de tokens
 * `slider`, spec 13). Pulgares propios con `role="slider"` (patrones «Slider» y «Slider
 * (Multi-Thumb)» de la APG), como el diseño: decidido por defecto en la G2.7 (opción (c)), porque
 * el spike de la opción (d) —inputs nativos invisibles— necesitaba Firefox y Safari para
 * confirmarse. Teclado, arrastre, RTL y el rango sin cruce los programa Mimi.
 *
 * Un solo `value` (spec 8): un número o, con `range`, `[desde, hasta]`.
 */

const optionalNumber = (v: unknown): number | undefined =>
  v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v);

const first = (v: MimiSliderValue | undefined): number | undefined =>
  Array.isArray(v) ? v[0] : (v ?? undefined);

/** Una marca: un valor y, si se quiere, su texto debajo de la pista. */
export type MimiSliderMark = number | { value: number; label?: string };
/** Cuándo se ve la burbuja con el valor. `auto`: al arrastrar y con el foco del teclado. */
export type MimiSliderShowValue = 'auto' | 'always' | 'never';
export type MimiSliderValue = number | [number, number] | null;

const THUMB_BASE = cn(
  'absolute top-1/2 box-border -translate-y-1/2 cursor-grab rounded-full border-2',
  'size-[var(--mimi-slider-thumb-s,var(--mimi-slider-thumb-size,20px))] bg-[color:var(--mimi-slider-thumb,var(--mimi-thumb,var(--mimi-background)))]',
  'shadow-[shadow:var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
  '[transition:box-shadow_.2s_ease,scale_.15s_cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none',
  // Hover y arrastre suman el halo a la sombra del pulgar (su token), con tipo (estilos 8).
  'not-aria-disabled:not-aria-readonly:hover:shadow-[shadow:0_0_0_6px_var(--mimi-ring-soft),var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
  // Clic: le crece el halo, como a Button (profundidad A); el pulgar no se hunde, crece al
  // arrastrar (DRAGGING).
  'not-aria-disabled:not-aria-readonly:active:shadow-[shadow:0_0_0_8px_var(--mimi-ring-soft),var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]',
  // Deshabilitado y solo lectura como los demás campos (utils/field-styles): sin hover.
  'aria-disabled:cursor-not-allowed aria-readonly:cursor-default',
  buttonFocusStyles,
);
const DRAGGING =
  'scale-[1.12] cursor-grabbing shadow-[shadow:0_0_0_8px_var(--mimi-ring-soft),var(--mimi-slider-thumb-shadow,var(--mimi-shadow-neutral))]';
/** Borde del pulgar y color de la parte llena: el relleno o, con error, `destructive`. */
const FILL = {
  ok: {
    bg: 'bg-[color:var(--mimi-slider-fill,var(--mimi-track-fill,var(--mimi-primary)))]',
    border: 'border-[color:var(--mimi-slider-fill,var(--mimi-track-fill,var(--mimi-primary)))]',
  },
  error: { bg: 'bg-destructive', border: 'border-destructive' },
} as const;

/**
 * Slider:
 *
 * ```html
 * <mimi-slider aria-label="Volumen" [(value)]="volumen" />
 * <mimi-slider aria-labelledby="precio" range [min]="0" [max]="1000" [step]="10"
 *   [format]="moneda" formControlName="precio" />   <!-- [300, 700] -->
 * ```
 */
@Component({
  selector: 'mimi-slider',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    <span
      aria-hidden="true"
      data-slot="track"
      class="absolute inset-x-0 h-[var(--mimi-slider-h,var(--mimi-slider-height,6px))] rounded-full bg-[color:var(--mimi-slider-track,var(--mimi-track,var(--mimi-input)))]"
    ></span>
    <span
      aria-hidden="true"
      data-slot="fill"
      class="absolute h-[var(--mimi-slider-h,var(--mimi-slider-height,6px))] rounded-full"
      [class]="fillClass()"
      [style.inset-inline-start.%]="fillStart()"
      [style.width.%]="fillWidth()"
    ></span>
    @for (mark of markList(); track mark.value) {
      <span
        aria-hidden="true"
        data-slot="mark"
        class="absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full ltr:-translate-x-1/2 rtl:translate-x-1/2"
        [class]="
          mark.inside
            ? 'bg-primary-foreground'
            : 'bg-[color:color-mix(in_oklab,var(--mimi-foreground)_30%,transparent)]'
        "
        [style.inset-inline-start.%]="mark.percent"
      ></span>
      @if (mark.label) {
        <span
          aria-hidden="true"
          data-slot="mark-label"
          class="absolute top-[26px] text-xs tabular-nums ltr:-translate-x-1/2 rtl:translate-x-1/2"
          [class]="mark.current ? 'font-semibold text-foreground' : 'text-muted-foreground'"
          [style.inset-inline-start.%]="mark.percent"
          >{{ mark.label }}</span
        >
      }
    }
    @for (thumb of thumbs(); track $index) {
      <span
        #thumb
        role="slider"
        data-slot="thumb"
        [class]="thumb.classes"
        [style.inset-inline-start.%]="thumb.percent"
        [attr.tabindex]="disabled() ? -1 : 0"
        [attr.aria-label]="thumb.label"
        [attr.aria-labelledby]="range() ? null : ariaLabelledby() || null"
        [attr.aria-valuemin]="thumb.min"
        [attr.aria-valuemax]="thumb.max"
        [attr.aria-valuenow]="thumb.value"
        [attr.aria-valuetext]="thumb.text"
        [attr.aria-orientation]="'horizontal'"
        [attr.aria-disabled]="disabled() || null"
        [attr.aria-readonly]="readonly() || null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.data-dragging]="dragging() === $index ? '' : null"
        (keydown)="onKeydown($event, $index)"
        (focus)="focused.set($index)"
        (blur)="onThumbBlur()"
      >
        @if (thumb.bubble) {
          <span
            aria-hidden="true"
            data-slot="bubble"
            class="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 rounded-[7px] bg-tooltip px-2 py-1 text-xs font-semibold whitespace-nowrap text-tooltip-foreground tabular-nums"
            >{{ thumb.text
            }}<span
              class="absolute -bottom-[3px] left-1/2 -ml-[3.5px] size-[7px] rotate-45 bg-tooltip"
            ></span
          ></span>
        }
      </span>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-range]': 'range() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.data-readonly]': 'readonly() ? "" : null',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.role]': 'range() ? "group" : null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
  },
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiSlider }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSlider implements FormValueControl<MimiSliderValue>, MimiFieldControl {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly dir = inject(Directionality).valueSignal;
  protected readonly text = inject(MIMI_SLIDER_TEXT);

  /** Un número o, con `range`, `[desde, hasta]`. Con `[(value)]` o un formulario. */
  readonly value = model<MimiSliderValue>(null);
  /** Dos pulgares que no se cruzan; el valor es `[desde, hasta]`. */
  readonly range = input(false, { transform: booleanAttribute });
  /** Mínimo (0 por defecto). También lo escribe Signal Forms desde el esquema. */
  readonly min = input<NonNullable<MimiSliderValue> | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  /** Máximo (100 por defecto). */
  readonly max = input<NonNullable<MimiSliderValue> | undefined, unknown>(undefined, {
    transform: optionalNumber,
  });
  readonly step = input(1, { transform: numberAttribute });
  /** Marcas sobre la pista, con su texto debajo si lo tienen. */
  readonly marks = input<readonly MimiSliderMark[]>([]);
  /** El texto del valor: `aria-valuetext` y la burbuja. Por defecto, el número. */
  readonly format = input<(value: number) => string>((value) => String(value));
  readonly showValue = input<MimiSliderShowValue>('auto');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): el valor se ve y se enfoca, pero no se mueve ni con el puntero ni con el teclado. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del contenedor, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Al soltar el pulgar o al salir el foco: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly thumbEls = viewChildren<ElementRef<HTMLElement>>('thumb');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.thumbEls()[0]?.nativeElement ?? this.host;
  }
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly focused = signal<number | null>(null);
  protected readonly dragging = signal<number | null>(null);

  // El tipo de `min` y `max` es el del valor (lo exige `FormValueControl`); se usa el número.
  private readonly lo = computed(() => Math.min(first(this.min()) ?? 0, first(this.max()) ?? 100));
  private readonly hi = computed(() => Math.max(first(this.min()) ?? 0, first(this.max()) ?? 100));
  /** Los valores que se pintan (acotados y en orden), sin tocar el modelo. */
  private readonly values = computed<number[]>(() => {
    const value = this.value();
    if (this.range()) {
      const [a, b] = Array.isArray(value) ? value : [this.lo(), this.hi()];
      const x = this.clamp(a);
      const y = this.clamp(b);
      return [Math.min(x, y), Math.max(x, y)];
    }
    const n = Array.isArray(value) ? value[0] : value;
    return [this.clamp(n ?? this.lo())];
  });
  private percentOf(value: number): number {
    const span = this.hi() - this.lo();
    return span > 0 ? ((value - this.lo()) / span) * 100 : 0;
  }

  /** Nombre del grupo (el aria-label o el texto de la etiqueta), para «Precio, Mínimo». */
  private readonly groupLabel = computed(() => {
    const label = this.ariaLabel()?.trim();
    if (label) return label;
    const ids = this.ariaLabelledby()?.trim();
    if (!ids) return '';
    // Desde la raíz del componente: también funciona fuera del documento (en pruebas).
    const root = this.host.getRootNode() as ParentNode;
    return ids
      .split(/\s+/)
      .map(
        (id) =>
          root.querySelector?.(`[id="${id.replace(/["\\]/g, '\\$&')}"]`)?.textContent?.trim() ?? '',
      )
      .join(' ')
      .trim();
  });

  protected readonly fillStart = computed(() =>
    this.range() ? this.percentOf(this.values()[0]) : 0,
  );
  protected readonly fillWidth = computed(() => {
    const values = this.values();
    return this.range()
      ? this.percentOf(values[1]) - this.percentOf(values[0])
      : this.percentOf(values[0]);
  });
  private readonly tone = computed(() => FILL[this.showInvalid() ? 'error' : 'ok']);
  protected readonly fillClass = computed(() => this.tone().bg);

  protected readonly thumbs = computed(() => {
    const values = this.values();
    const range = this.range();
    const show = this.showValue();
    const group = this.groupLabel();
    return values.map((value, i) => {
      const own = range ? (i === 0 ? this.text.minimum : this.text.maximum) : null;
      const active = this.dragging() === i || this.focused() === i;
      return {
        value,
        percent: this.percentOf(value),
        // En el rango, cada pulgar no puede pasar al otro.
        min: range && i === 1 ? values[0] : this.lo(),
        max: range && i === 0 ? values[1] : this.hi(),
        text: this.format()(value),
        label: own ? (group ? `${group}, ${own}` : own) : this.ariaLabel() || null,
        bubble: show === 'always' || (show === 'auto' && active && !this.disabled()),
        classes: cn(
          THUMB_BASE,
          'ltr:-translate-x-1/2 rtl:translate-x-1/2',
          this.tone().border,
          this.dragging() === i && DRAGGING,
        ),
      };
    });
  });

  protected readonly markList = computed(() => {
    const values = this.values();
    const range = this.range();
    return this.marks().map((mark) => {
      const value = typeof mark === 'number' ? mark : mark.value;
      const label = typeof mark === 'number' ? '' : (mark.label ?? '');
      const inside = range ? value >= values[0] && value <= values[1] : value <= values[0];
      return {
        value,
        label,
        percent: this.percentOf(this.clamp(value)),
        inside,
        current: values.includes(value),
      };
    });
  });

  protected readonly classes = computed(() =>
    cn(
      // 24px de alto: todo el anfitrión recibe el puntero (va el pulgar más cercano), así el
      // objetivo táctil cumple 2.5.8 aunque los dos pulgares estén juntos (5.17b).
      'relative flex h-6 w-full touch-none items-center select-none',
      this.markList().some((m) => m.label) && 'mb-6',
      this.disabled()
        ? 'cursor-not-allowed opacity-[var(--mimi-disabled-opacity,0.5)]'
        : 'cursor-pointer',
      this.userClass(),
    ),
  );

  protected onKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled() || this.readonly()) return;
    const step = this.step() > 0 ? this.step() : 1;
    const rtl = this.dir() === 'rtl';
    const current = this.values()[index];
    const next: Record<string, number> = {
      ArrowRight: current + (rtl ? -step : step),
      ArrowLeft: current + (rtl ? step : -step),
      ArrowUp: current + step,
      ArrowDown: current - step,
      PageUp: current + step * 10,
      PageDown: current - step * 10,
      Home: this.lo(),
      End: this.hi(),
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    this.setThumb(index, next[event.key]);
  }

  /** Puntero en el contenedor: mueve el pulgar más cercano, le da el foco y lo arrastra. */
  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled() || this.readonly() || event.button !== 0) return;
    const value = this.valueAt(event.clientX);
    if (value === null) return;
    const values = this.values();
    let index = 0;
    if (this.range()) {
      const [a, b] = values;
      index =
        Math.abs(value - a) < Math.abs(value - b)
          ? 0
          : Math.abs(value - a) > Math.abs(value - b)
            ? 1
            : value > b
              ? 1
              : 0;
    }
    event.preventDefault();
    this.dragging.set(index);
    this.host.setPointerCapture?.(event.pointerId);
    this.thumbEls()[index]?.nativeElement.focus();
    this.setThumb(index, value);
  }

  protected onPointerMove(event: PointerEvent): void {
    const index = this.dragging();
    if (index === null) return;
    const value = this.valueAt(event.clientX);
    if (value !== null) this.setThumb(index, value);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.dragging() === null) return;
    this.dragging.set(null);
    if (this.host.hasPointerCapture?.(event.pointerId)) {
      this.host.releasePointerCapture(event.pointerId);
    }
    this.touch.emit();
  }

  protected onThumbBlur(): void {
    this.focused.set(null);
    if (this.dragging() === null) this.touch.emit();
  }

  /** El valor bajo una posición del puntero (con el paso; en RTL, de derecha a izquierda). */
  private valueAt(clientX: number): number | null {
    const rect = this.host.getBoundingClientRect();
    if (!rect.width) return null;
    let ratio = (clientX - rect.left) / rect.width;
    if (this.dir() === 'rtl') ratio = 1 - ratio;
    ratio = Math.min(1, Math.max(0, ratio));
    return this.lo() + ratio * (this.hi() - this.lo());
  }

  /** Pone un pulgar: redondea al paso, acota y, en el rango, no deja que cruce al otro. */
  private setThumb(index: number, raw: number): void {
    let value = this.clamp(this.roundToStep(raw));
    if (this.range()) {
      const values = [...this.values()] as [number, number];
      value = index === 0 ? Math.min(value, values[1]) : Math.max(value, values[0]);
      values[index] = value;
      const current = this.value();
      if (!Array.isArray(current) || current[0] !== values[0] || current[1] !== values[1]) {
        this.value.set(values);
      }
      return;
    }
    if (this.value() !== value) this.value.set(value);
  }

  private clamp(value: number): number {
    return Math.min(this.hi(), Math.max(this.lo(), Number.isFinite(value) ? value : this.lo()));
  }

  private roundToStep(value: number): number {
    const step = this.step() > 0 ? this.step() : 1;
    const decimals = (String(step).split('.')[1] ?? '').length;
    const rounded = this.lo() + Math.round((value - this.lo()) / step) * step;
    return Number(rounded.toFixed(decimals));
  }
}
