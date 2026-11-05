import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { MimiInput } from '@/components/ui/input';
import { MimiPopover, MimiPopoverContent, MimiPopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils/cn';
import {
  buttonFocusStyles,
  controlInvalidStyles,
  controlPressStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';
import {
  type MimiColorFormat,
  type MimiHsv,
  mimiFormatOklch,
  mimiHexToRgb,
  mimiHsvToRgb,
  mimiNormalizeHex,
  mimiParseColor,
  mimiRgbToHex,
  mimiRgbToHsv,
} from './color';
import { MIMI_COLOR_PICKER_TEXT } from './color-picker-texts';

/*
 * Color Picker (docs/design/Mimi Color Picker.dc.html; prefijo de tokens `color-picker`, spec
 * 13). Dos piezas (decidido por defecto en la G2.12, opción (a)): el panel `mimi-color-picker` y
 * el disparador `mimi-color-input`, que lo abre en un Popover. El valor es siempre hex en
 * minúsculas; se elige en HSV (el área y el tono, controles propios: el Slider de Mimi pinta la
 * pista con un color, no con el degradado del espectro) y se ve y escribe en HEX u OKLCH.
 *
 * Los degradados del área y del tono son el espacio de color (datos, no tema): van en `style`. El
 * borde y la sombra de los pulgares son tokens del componente (decidido por defecto).
 */

const SPECTRUM =
  'linear-gradient(to right, rgb(255 0 0), rgb(255 255 0), rgb(0 255 0), rgb(0 255 255), rgb(0 0 255), rgb(255 0 255), rgb(255 0 0))';

const THUMB =
  'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color:var(--mimi-color-picker-thumb-border,oklch(1_0_0))] shadow-[shadow:var(--mimi-color-picker-thumb-shadow,0_0_0_1px_oklch(0_0_0/.25),0_2px_4px_oklch(0_0_0/.3))]';
/** El foco del área y del tono: el contorno de los botones (separado 2px). */
const SLIDER_FOCUS = buttonFocusStyles;
const SWATCH_BASE = cn(
  'size-full cursor-pointer border-0 shadow-[shadow:inset_0_0_0_1px_var(--mimi-color-picker-swatch-border,oklch(0_0_0/.1))] mimi-transition hover:scale-[1.12] active:scale-90',
  buttonFocusStyles,
);
const SWATCH = {
  palette: cn(SWATCH_BASE, 'aspect-square rounded-full'),
  paletteOn: cn(
    SWATCH_BASE,
    'aspect-square rounded-full shadow-[shadow:0_0_0_2px_var(--mimi-popover),0_0_0_4px_var(--mimi-foreground)]',
  ),
  recent: cn(SWATCH_BASE, 'aspect-square rounded-[var(--mimi-radius-sm)]'),
  recentOn: cn(
    SWATCH_BASE,
    'aspect-square rounded-[var(--mimi-radius-sm)] shadow-[shadow:0_0_0_2px_var(--mimi-popover),0_0_0_4px_var(--mimi-foreground)]',
  ),
} as const;
const FORMAT_ITEM =
  'h-7 flex-1 cursor-pointer rounded-[calc(var(--mimi-radius-sm)-2px)] border-0 text-[11.5px] font-semibold mimi-transition';
const FORMAT = {
  on: cn(FORMAT_ITEM, 'bg-background text-foreground shadow-sm', buttonFocusStyles),
  off: cn(
    FORMAT_ITEM,
    'bg-transparent text-muted-foreground hover:text-foreground',
    buttonFocusStyles,
  ),
} as const;
const SECTION_TITLE = 'text-[11px] font-semibold tracking-[.06em] text-muted-foreground uppercase';

const toHsv = (hex: string): MimiHsv | null => {
  const rgb = mimiHexToRgb(hex);
  return rgb ? mimiRgbToHsv(rgb) : null;
};
const fromHsv = (hsv: MimiHsv) => mimiRgbToHex(mimiHsvToRgb(hsv));

let nextId = 0;

/**
 * El panel: área de saturación y brillo, tono, formato y valor, paleta y recientes.
 *
 * ```html
 * <mimi-color-picker [(value)]="color" [swatches]="paleta" [(recent)]="recientes" />
 * ```
 *
 * Implementa `FormValueControl<string>` (hex). Un valor inválido que llega del formulario se
 * muestra en el campo sin reescribirlo.
 */
@Component({
  selector: 'mimi-color-picker',
  imports: [MimiInput],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiColorPicker }],
  template: `
    <div
      #area
      role="slider"
      data-slot="area"
      class="relative h-[var(--mimi-color-picker-area-height,150px)] cursor-crosshair touch-none rounded-[var(--mimi-color-picker-area-radius,var(--mimi-radius-sm))]"
      [class]="sliderFocus"
      [style.background]="areaBackground()"
      [attr.tabindex]="disabled() ? -1 : 0"
      [attr.aria-label]="texts.area"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="100"
      [attr.aria-valuenow]="saturation()"
      [attr.aria-valuetext]="texts.areaValue(saturation(), brightness())"
      [attr.aria-disabled]="disabled() || null"
      (pointerdown)="onAreaPointer($event, true)"
      (pointermove)="onAreaPointer($event, false)"
      (pointerup)="endDrag($event)"
      (keydown)="onAreaKeydown($event)"
      (focusout)="rememberRecent()"
    >
      <span
        aria-hidden="true"
        data-slot="area-thumb"
        class="size-3.5"
        [class]="thumbClasses"
        [style.left.%]="saturation()"
        [style.top.%]="100 - brightness()"
        [style.background-color]="hex()"
      ></span>
    </div>

    <div class="flex items-center gap-3">
      <div
        #hueBar
        role="slider"
        data-slot="hue"
        class="relative h-[var(--mimi-color-picker-hue-height,12px)] flex-1 cursor-pointer touch-none rounded-full"
        [class]="sliderFocus"
        [style.background]="spectrum"
        [attr.tabindex]="disabled() ? -1 : 0"
        [attr.aria-label]="texts.hue"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="360"
        [attr.aria-valuenow]="hue()"
        [attr.aria-disabled]="disabled() || null"
        (pointerdown)="onHuePointer($event, true)"
        (pointermove)="onHuePointer($event, false)"
        (pointerup)="endDrag($event)"
        (keydown)="onHueKeydown($event)"
        (focusout)="rememberRecent()"
      >
        <span
          aria-hidden="true"
          data-slot="hue-thumb"
          class="top-1/2 size-4"
          [class]="thumbClasses"
          [style.left.%]="(hue() / 360) * 100"
          [style.background-color]="hueColor()"
        ></span>
      </div>
      <span
        aria-hidden="true"
        data-slot="current"
        class="size-7 shrink-0 rounded-full shadow-[shadow:inset_0_0_0_1px_var(--mimi-color-picker-swatch-border,oklch(0_0_0/.1))]"
        [style.background-color]="hex()"
      ></span>
    </div>

    <div class="flex items-center gap-2">
      <div
        role="radiogroup"
        class="flex w-[104px] shrink-0 gap-0.5 rounded-[var(--mimi-radius-sm)] bg-muted p-0.5"
        [attr.aria-label]="texts.format"
        (keydown)="onFormatKeydown($event)"
      >
        @for (item of formats; track item.id) {
          <button
            type="button"
            role="radio"
            [attr.data-format]="item.id"
            [attr.aria-checked]="shownFormat() === item.id"
            [attr.tabindex]="shownFormat() === item.id ? 0 : -1"
            [class]="shownFormat() === item.id ? formatOn : formatOff"
            [disabled]="disabled()"
            (click)="shownFormat.set(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </div>
      <input
        mimiInput
        size="sm"
        type="text"
        spellcheck="false"
        autocomplete="off"
        data-slot="value"
        class="h-8 min-w-0 flex-1 font-mono text-xs"
        [value]="draft()"
        [disabled]="disabled()"
        [attr.aria-label]="texts.value"
        [attr.aria-invalid]="draftInvalid() || null"
        [attr.aria-describedby]="clipped() ? clippedId : null"
        (input)="draft.set($any($event.target).value)"
        (keydown.enter)="commitDraft()"
        (blur)="commitDraft()"
      />
    </div>
    @if (clipped()) {
      <span [id]="clippedId" data-slot="clipped" class="-mt-1.5 text-xs text-muted-foreground">{{
        texts.clipped
      }}</span>
    }

    @if (swatches().length) {
      <div class="flex flex-col gap-1.5">
        <span [class]="sectionTitle" [id]="paletteId">{{ texts.palette }}</span>
        <div
          role="group"
          data-slot="palette"
          class="grid grid-cols-8 gap-[var(--mimi-color-picker-swatch-gap,6px)]"
          [attr.aria-labelledby]="paletteId"
          (keydown)="onSwatchKeydown($event)"
        >
          @for (swatch of swatches(); track swatch; let i = $index) {
            <button
              type="button"
              [class]="isCurrent(swatch) ? swatchClasses.paletteOn : swatchClasses.palette"
              [style.background-color]="swatch"
              [attr.aria-label]="swatch"
              [attr.aria-pressed]="isCurrent(swatch)"
              [attr.tabindex]="i === paletteIndex() ? 0 : -1"
              [disabled]="disabled()"
              (focus)="paletteIndex.set(i)"
              (click)="pickSwatch(swatch)"
            ></button>
          }
        </div>
      </div>
    }

    @if (showRecent()) {
      <div class="flex flex-col gap-1.5">
        <span [class]="sectionTitle" [id]="recentId">{{ texts.recent }}</span>
        @if (recent().length) {
          <div
            role="group"
            data-slot="recent"
            class="grid grid-cols-8 gap-[var(--mimi-color-picker-swatch-gap,6px)]"
            [attr.aria-labelledby]="recentId"
            (keydown)="onSwatchKeydown($event)"
          >
            @for (swatch of recent(); track swatch; let i = $index) {
              <button
                type="button"
                [class]="isCurrent(swatch) ? swatchClasses.recentOn : swatchClasses.recent"
                [style.background-color]="swatch"
                [attr.aria-label]="swatch"
                [attr.aria-pressed]="isCurrent(swatch)"
                [attr.tabindex]="i === recentIndex() ? 0 : -1"
                [disabled]="disabled()"
                (focus)="recentIndex.set(i)"
                (click)="pickSwatch(swatch)"
              ></button>
            }
          </div>
        } @else {
          <span class="text-xs text-muted-foreground">{{ texts.noRecent }}</span>
        }
      </div>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '[attr.aria-label]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiColorPicker implements FormValueControl<string>, MimiFieldControl {
  protected readonly texts = inject(MIMI_COLOR_PICKER_TEXT);

  /** El color, en hex de 6 dígitos en minúsculas (`#4f46e5`). */
  readonly value = model('');
  /** La paleta (colores en hex). Sin paleta, no se muestra. */
  readonly swatches = input<readonly string[]>([]);
  /** Los recientes (hasta 8; el último elegido primero). `[(recent)]` para guardarlos. */
  readonly recent = model<string[]>([]);
  /** Muestra la sección de recientes. */
  readonly showRecent = input(true, { transform: booleanAttribute });
  /** Formato del campo al empezar (HEX u OKLCH). El valor sigue siendo hex. */
  readonly format = input<MimiColorFormat>('hex');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  readonly touch = output<void>();

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('area');
  private readonly hueBar = viewChild.required<ElementRef<HTMLElement>>('hueBar');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.area().nativeElement;
  }
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  private readonly baseId = `mimi-color-picker-${nextId++}`;
  protected readonly paletteId = `${this.baseId}-palette`;
  protected readonly recentId = `${this.baseId}-recent`;
  protected readonly clippedId = `${this.baseId}-clipped`;
  protected readonly spectrum = SPECTRUM;
  protected readonly thumbClasses = THUMB;
  protected readonly sliderFocus = SLIDER_FOCUS;
  protected readonly swatchClasses = SWATCH;
  protected readonly formatOn = FORMAT.on;
  protected readonly formatOff = FORMAT.off;
  protected readonly sectionTitle = SECTION_TITLE;
  protected readonly formats = [
    { id: 'hex', label: 'HEX' },
    { id: 'oklch', label: 'OKLCH' },
  ] as const;

  protected readonly classes = computed(() =>
    cn(
      'flex w-[var(--mimi-color-picker-width,280px)] max-w-full flex-col gap-[var(--mimi-color-picker-padding,12px)] font-sans text-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
      this.userClass(),
    ),
  );

  /**
   * HSV que se pinta. Sigue al valor, pero si el valor es el mismo hex que ya da este HSV, no se
   * recalcula (no saltan los pulgares al redondear), y un gris o un negro conservan el tono.
   */
  private readonly hsv = linkedSignal<string, MimiHsv>({
    source: () => mimiNormalizeHex(this.value()) ?? '',
    computation: (hex, previous) => {
      const before = previous?.value ?? { h: 0, s: 0, v: 0 };
      if (!hex) return before;
      if (previous && fromHsv(before) === hex) return before;
      const next = toHsv(hex)!;
      return next.s === 0 || next.v === 0 ? { ...next, h: before.h } : next;
    },
  });

  protected readonly hex = computed(() => fromHsv(this.hsv()));
  protected readonly hue = computed(() => Math.round(this.hsv().h));
  protected readonly saturation = computed(() => Math.round(this.hsv().s * 100));
  protected readonly brightness = computed(() => Math.round(this.hsv().v * 100));
  protected readonly hueColor = computed(() => fromHsv({ h: this.hsv().h, s: 1, v: 1 }));
  protected readonly areaBackground = computed(
    () =>
      `linear-gradient(to top, rgb(0 0 0), transparent), linear-gradient(to right, rgb(255 255 255), ${this.hueColor()})`,
  );

  protected readonly shownFormat = linkedSignal<MimiColorFormat>(() => this.format());
  /** El texto del campo: el valor en el formato elegido, o lo que se está escribiendo. */
  protected readonly draft = linkedSignal(() => {
    const value = this.value();
    const hex = mimiNormalizeHex(value);
    if (!hex) return value;
    return this.shownFormat() === 'oklch' ? mimiFormatOklch(hex) : hex;
  });
  protected readonly draftInvalid = signal(false);
  /** El OKLCH escrito estaba fuera de sRGB y se recortó. */
  protected readonly clipped = signal(false);

  protected readonly paletteIndex = linkedSignal(() =>
    Math.max(
      0,
      this.swatches().findIndex((s) => this.isCurrent(s)),
    ),
  );
  protected readonly recentIndex = linkedSignal(() =>
    Math.max(
      0,
      this.recent().findIndex((s) => this.isCurrent(s)),
    ),
  );

  private dragging: HTMLElement | null = null;

  constructor() {
    // Al cambiar el formato, lo escrito vuelve a ser el valor en el formato nuevo.
    effect(() => {
      this.shownFormat();
      untracked(() => {
        this.draftInvalid.set(false);
        this.clipped.set(false);
      });
    });
  }

  focus(options?: FocusOptions): void {
    this.area().nativeElement.focus(options);
  }

  protected isCurrent(color: string): boolean {
    return mimiNormalizeHex(color) === mimiNormalizeHex(this.value());
  }

  private setHsv(hsv: MimiHsv): void {
    if (this.disabled()) return;
    this.hsv.set(hsv);
    this.value.set(fromHsv(hsv));
    this.clipped.set(false);
    this.draftInvalid.set(false);
  }

  /** Guarda el color actual en los recientes (al soltar, al salir del control o al elegir). */
  protected rememberRecent(): void {
    const hex = mimiNormalizeHex(this.value());
    if (!hex) return;
    const recent = this.recent();
    if (recent[0] === hex) return;
    this.recent.set([hex, ...recent.filter((c) => mimiNormalizeHex(c) !== hex)].slice(0, 8));
  }

  private ratio(event: PointerEvent, element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    return {
      x: rect.width ? clamp((event.clientX - rect.left) / rect.width) : 0,
      y: rect.height ? clamp((event.clientY - rect.top) / rect.height) : 0,
    };
  }

  private startDrag(event: PointerEvent, element: HTMLElement): void {
    event.preventDefault();
    element.focus();
    element.setPointerCapture?.(event.pointerId);
    this.dragging = element;
  }

  protected endDrag(event: PointerEvent): void {
    if (!this.dragging) return;
    this.dragging.releasePointerCapture?.(event.pointerId);
    this.dragging = null;
    this.rememberRecent();
    this.touch.emit();
  }

  protected onAreaPointer(event: PointerEvent, start: boolean): void {
    if (this.disabled()) return;
    const element = this.area().nativeElement;
    if (start) this.startDrag(event, element);
    else if (this.dragging !== element) return;
    const { x, y } = this.ratio(event, element);
    this.setHsv({ h: this.hsv().h, s: x, v: 1 - y });
  }

  protected onHuePointer(event: PointerEvent, start: boolean): void {
    if (this.disabled()) return;
    const element = this.hueBar().nativeElement;
    if (start) this.startDrag(event, element);
    else if (this.dragging !== element) return;
    this.setHsv({ ...this.hsv(), h: this.ratio(event, element).x * 360 });
  }

  /** ← → saturación, ↑ ↓ brillo, de a 2 % (el diseño); Inicio/Fin, saturación 0 y 100 %. */
  protected onAreaKeydown(event: KeyboardEvent): void {
    const { s, v, h } = this.hsv();
    const step = 0.02;
    const keys: Record<string, MimiHsv> = {
      ArrowLeft: { h, s: Math.max(0, s - step), v },
      ArrowRight: { h, s: Math.min(1, s + step), v },
      ArrowDown: { h, s, v: Math.max(0, v - step) },
      ArrowUp: { h, s, v: Math.min(1, v + step) },
      Home: { h, s: 0, v },
      End: { h, s: 1, v },
    };
    const next = keys[event.key];
    if (!next) return;
    event.preventDefault();
    this.setHsv(next);
  }

  /** Flechas de a 3° (el diseño); Re Pág/Av Pág de a 30°; Inicio/Fin, 0° y 360°. */
  protected onHueKeydown(event: KeyboardEvent): void {
    const { h } = this.hsv();
    const keys: Record<string, number> = {
      ArrowLeft: h - 3,
      ArrowDown: h - 3,
      ArrowRight: h + 3,
      ArrowUp: h + 3,
      PageDown: h - 30,
      PageUp: h + 30,
      Home: 0,
      End: 360,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.setHsv({ ...this.hsv(), h: Math.min(360, Math.max(0, next)) });
  }

  /** Flechas en el grupo de formato (radio). */
  protected onFormatKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next: MimiColorFormat = this.shownFormat() === 'hex' ? 'oklch' : 'hex';
    this.shownFormat.set(next);
    const group = event.currentTarget as HTMLElement;
    queueMicrotask(() => group.querySelector<HTMLElement>(`[data-format="${next}"]`)?.focus());
  }

  /** Paleta y recientes: una parada de Tab y flechas (decidido por defecto en la G2.12). */
  protected onSwatchKeydown(event: KeyboardEvent): void {
    const buttons = Array.from(
      (event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    );
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const columns = 8;
    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      ArrowUp: index - columns,
      ArrowDown: index + columns,
      Home: 0,
      End: buttons.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    buttons[Math.min(buttons.length - 1, Math.max(0, next))]?.focus();
  }

  protected pickSwatch(color: string): void {
    const hex = mimiNormalizeHex(color);
    if (!hex || this.disabled()) return;
    this.value.set(hex);
    this.clipped.set(false);
    this.draftInvalid.set(false);
    this.rememberRecent();
    this.touch.emit();
  }

  /** Enter o salir del campo: lo escrito pasa a ser el valor si se entiende. */
  protected commitDraft(): void {
    const text = (this.draft() ?? '').trim();
    const current = mimiNormalizeHex(this.value());
    const shown = current
      ? this.shownFormat() === 'oklch'
        ? mimiFormatOklch(current)
        : current
      : this.value();
    if (text === shown) return;
    const parsed = mimiParseColor(text);
    if (!parsed) {
      this.draftInvalid.set(true);
      return;
    }
    this.draftInvalid.set(false);
    this.value.set(parsed.hex);
    this.clipped.set(parsed.clipped);
    // El campo muestra el valor guardado (recortado, si hacía falta).
    this.draft.set(this.shownFormat() === 'oklch' ? mimiFormatOklch(parsed.hex) : parsed.hex);
    this.rememberRecent();
    this.touch.emit();
  }
}

/** El disparador: la caja de Input con la muestra y el valor. */
const TRIGGER_CLASSES = cn(
  'flex h-[var(--mimi-control-height,2.5rem)] w-full min-w-0 cursor-pointer items-center gap-2 px-3 text-left font-mono text-sm text-foreground',
  'rounded-[var(--mimi-radius,0.75rem)] border border-input bg-input-background not-disabled:hover:border-input-hover',
  'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
  fieldFocusStyles,
  controlInvalidStyles,
  controlPressStyles,
);

let nextInputId = 0;

/**
 * Disparador con Popover (el diseño no lo dibuja; propuesta de la G2.12):
 *
 * ```html
 * <mimi-color-input aria-label="Color de marca" [(value)]="color" [swatches]="paleta" />
 * ```
 *
 * Implementa `FormValueControl<string>`.
 */
@Component({
  selector: 'mimi-color-input',
  imports: [MimiPopover, MimiPopoverTrigger, MimiPopoverContent, MimiColorPicker],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiColorInput }],
  template: `
    <mimi-popover
      align="start"
      [arrow]="false"
      [class]="panelClasses()"
      [(open)]="open"
      (openChange)="onOpenChange($event)"
      aria-label="{{ texts.pickColor }}"
    >
      <button
        #trigger
        type="button"
        mimiPopoverTrigger
        [id]="controlId()"
        [class]="classes()"
        [disabled]="disabled()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledby() || null"
        [attr.aria-describedby]="valueId"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-required]="required() || null"
      >
        <span
          aria-hidden="true"
          data-slot="swatch"
          class="size-5 shrink-0 rounded-full shadow-[shadow:inset_0_0_0_1px_var(--mimi-color-picker-swatch-border,oklch(0_0_0/.1))]"
          [style.background-color]="swatch()"
        ></span>
        <span
          class="min-w-0 flex-1 truncate"
          [id]="valueId"
          [class.text-muted-foreground]="!value()"
          >{{ value() || placeholder() }}</span
        >
      </button>
      <ng-template mimiPopoverContent>
        <mimi-color-picker
          class="w-full"
          [value]="value()"
          [swatches]="swatches()"
          [(recent)]="recent"
          [showRecent]="showRecent()"
          [format]="format()"
          (valueChange)="value.set($event)"
        />
      </ng-template>
    </mimi-popover>
  `,
  host: {
    class: 'block w-full min-w-0',
    '[attr.class]': 'null',
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-invalid]': 'showInvalid() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiColorInput implements FormValueControl<string>, MimiFieldControl {
  protected readonly texts = inject(MIMI_COLOR_PICKER_TEXT);

  readonly value = model('');
  readonly swatches = input<readonly string[]>([]);
  readonly recent = model<string[]>([]);
  readonly showRecent = input(true, { transform: booleanAttribute });
  readonly format = input<MimiColorFormat>('hex');
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });
  readonly panelClass = input('');

  readonly touch = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.trigger().nativeElement;
  }

  private readonly baseId = `mimi-color-input-${nextInputId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  protected readonly valueId = `${this.baseId}-value`;
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));
  protected readonly open = signal(false);
  /** La muestra solo pinta un color válido. */
  protected readonly swatch = computed(() => mimiNormalizeHex(this.value()) ?? 'transparent');
  protected readonly classes = computed(() => cn(TRIGGER_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() =>
    cn(
      'w-[var(--mimi-color-picker-width,280px)] p-[var(--mimi-color-picker-padding,12px)] bg-[color:var(--mimi-color-picker-bg,var(--mimi-popover))] shadow-[shadow:var(--mimi-color-picker-shadow,var(--mimi-shadow-popover))] rounded-[var(--mimi-color-picker-radius,var(--mimi-radius))]',
      this.panelClass(),
    ),
  );

  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.touch.emit();
  }
}

/** Las dos piezas, para importarlas juntas. */
export const MimiColorPickerImports = [MimiColorPicker, MimiColorInput] as const;
