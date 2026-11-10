import {
  ChangeDetectionStrategy,
  Component,
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
import { MimiCalendar } from '@/components/ui/calendar/calendar';
import { MIMI_DATE_PICKER_TEXT } from '@/components/ui/calendar/calendar-texts';
import {
  type MimiDate,
  type MimiDateRange,
  mimiDaysBetween,
  mimiFormatDate,
  mimiIsDate,
} from '@/components/ui/calendar/dates';
import {
  MIMI_DATE_PANEL_CLASSES,
  MIMI_DATE_TRIGGER_CLASSES,
} from '@/components/ui/date-picker/date-picker';
import { MimiPopover, MimiPopoverContent, MimiPopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';

/*
 * Date Range (docs/design/Mimi F3 Combobox Fechas Hora.dc.html, «2 · Date Picker y Date
 * Range»; prefijo de tokens `date`, spec 13): un botón con el periodo y la cuenta de días que
 * abre el calendario en modo rango, con atajos opcionales. Componente aparte del Date Picker
 * (decidido por defecto en la G2.9), con el mismo calendario.
 *
 * Elección: el primer clic marca el inicio; el segundo, el fin (si es anterior, se intercambian);
 * el siguiente empieza otro periodo. El modelo cambia solo con los dos extremos (decidido por
 * defecto en la G2.9): lo que se ve con solo el inicio vive en Mimi.
 */

/** Un atajo: texto y periodo (`{ label: 'Últimos 7 días', range: { start, end } }`). */
export interface MimiDateRangePreset {
  label: string;
  range: MimiDateRange;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const PRESET_BASE = cn(
  'h-8 cursor-pointer rounded-[var(--mimi-radius-sm)] border-0 px-2 text-left text-[13px] text-foreground mimi-transition hover:bg-accent active:scale-(--mimi-press-scale)',
  buttonFocusStyles,
);
const PRESET = {
  on: cn(PRESET_BASE, 'bg-accent font-semibold'),
  off: cn(PRESET_BASE, 'bg-transparent'),
} as const;

const toDate = (value: unknown): MimiDate | undefined =>
  value === null || value === undefined || value === '' ? undefined : String(value);

const isRange = (value: unknown): value is MimiDateRange =>
  !!value &&
  typeof value === 'object' &&
  mimiIsDate((value as MimiDateRange).start) &&
  mimiIsDate((value as MimiDateRange).end);

let nextId = 0;

/**
 * Date Range:
 *
 * ```html
 * <mimi-date-range aria-label="Periodo" [(value)]="periodo" [maxDate]="hoy" [presets]="atajos" />
 * ```
 *
 * `value` es `{ start, end }` con fechas ISO (`MimiDateRange`), o `null`. Implementa
 * `FormValueControl`. `class` va al disparador y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-date-range',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [MimiPopover, MimiPopoverTrigger, MimiPopoverContent, MimiCalendar],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiDateRangePicker }],
  template: `
    <mimi-popover
      align="start"
      [arrow]="false"
      [class]="panelClasses()"
      [(open)]="open"
      [blocked]="readonly()"
      (openChange)="onOpenChange($event)"
      aria-label="{{ texts.pickRange }}"
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
        [attr.aria-readonly]="readonly() || null"
        [attr.data-placeholder]="label() ? null : ''"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Lucide calendar-range (ISC) -->
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <path d="M8 2v4" />
          <path d="M17 14h-6" />
          <path d="M13 18H7" />
          <path d="M7 14h.01" />
          <path d="M17 18h.01" />
        </svg>
        <span [id]="valueId" class="flex min-w-0 flex-1 items-center gap-2">
          <span
            class="min-w-0 flex-1 truncate tabular-nums"
            [class.text-muted-foreground]="!label()"
            >{{ label() || placeholder() }}</span
          >
          @if (days(); as days) {
            <!-- La coma separa la fecha de los días para el lector (el espacio lo da el flex). -->
            <span class="sr-only">, </span>
            <span data-slot="days" class="shrink-0 text-xs text-muted-foreground">{{ days }}</span>
          }
        </span>
      </button>
      <ng-template mimiPopoverContent>
        @if (presets().length) {
          <div
            data-slot="presets"
            class="flex w-[var(--mimi-date-presets-width,130px)] shrink-0 flex-col gap-0.5 border-e border-border p-2"
          >
            @for (preset of presets(); track preset.label) {
              <button
                type="button"
                [class]="isPreset(preset) ? presetOn : presetOff"
                [attr.aria-pressed]="isPreset(preset)"
                (click)="pickPreset(preset)"
              >
                {{ preset.label }}
              </button>
            }
          </div>
        }
        <div class="flex flex-col gap-2 p-[var(--mimi-date-padding,12px)]">
          <mimi-calendar
            mode="range"
            [size]="sized.resolved()"
            [rangeStart]="shownStart()"
            [rangeEnd]="shownEnd()"
            [min]="minDate() ?? null"
            [max]="maxDate() ?? null"
            [isDateDisabled]="isDateDisabled()"
            [locale]="lang()"
            [weekStart]="weekStart()"
            (datePick)="pickDay($event)"
          />
          <span data-slot="help" class="text-xs text-muted-foreground" aria-live="polite">{{
            startPick() ? texts.pickEnd : texts.pickStart
          }}</span>
        </div>
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
export class MimiDateRangePicker
  implements FormValueControl<MimiDateRange | null>, MimiFieldControl
{
  private readonly defaultLocale = inject(LOCALE_ID);
  protected readonly texts = inject(MIMI_DATE_PICKER_TEXT);
  /** El panel va en un overlay, fuera del anfitrión: el calendario recibe el tamaño. */
  protected readonly sized = inject(MimiSized);

  /** El periodo (`{ start: '2026-09-24', end: '2026-09-30' }`), o `null`. */
  readonly value = model<MimiDateRange | null>(null);
  /**
   * Primera y última fecha que se pueden elegir. No se llaman `min`/`max`: `FormValueControl` les
   * daría el tipo del valor (un periodo).
   */
  readonly minDate = input<MimiDate | undefined, unknown>(undefined, { transform: toDate });
  readonly maxDate = input<MimiDate | undefined, unknown>(undefined, { transform: toDate });
  /** Fechas que no se pueden elegir como inicio o fin. */
  readonly isDateDisabled = input<((date: MimiDate) => boolean) | null>(null);
  /** Atajos de la columna izquierda. Sin atajos, no hay columna. */
  readonly presets = input<readonly MimiDateRangePreset[]>([]);
  readonly locale = input<string>();
  readonly weekStart = input<number>();
  /** Formato de cada fecha en el botón (opciones de `Intl.DateTimeFormat`). */
  readonly format = input<Intl.DateTimeFormatOptions>(DEFAULT_FORMAT);
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): el valor se ve y se puede enfocar, pero no cambia ni abre el panel. */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });
  readonly panelClass = input('');

  /** Se cerró el panel: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.trigger().nativeElement;
  }

  private readonly baseId = `mimi-date-range-${nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  protected readonly valueId = `${this.baseId}-value`;
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly open = signal(false);
  /** Inicio elegido mientras falta el fin (no está en el modelo). */
  protected readonly startPick = signal<MimiDate | null>(null);
  protected readonly presetOn = PRESET.on;
  protected readonly presetOff = PRESET.off;

  protected readonly lang = computed(() => this.locale() || this.defaultLocale);
  protected readonly classes = computed(() => cn(MIMI_DATE_TRIGGER_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() =>
    cn(MIMI_DATE_PANEL_CLASSES, 'flex-row gap-0 overflow-hidden p-0', this.panelClass()),
  );

  private readonly range = computed(() => {
    const value = this.value();
    return isRange(value) ? value : null;
  });
  protected readonly shownStart = computed(() => this.startPick() ?? this.range()?.start ?? null);
  protected readonly shownEnd = computed(() =>
    this.startPick() ? null : (this.range()?.end ?? null),
  );

  protected readonly label = computed(() => {
    const range = this.range();
    if (!range) return '';
    const format = (date: MimiDate) => mimiFormatDate(date, this.lang(), this.format());
    return `${format(range.start)} – ${format(range.end)}`;
  });
  protected readonly days = computed(() => {
    const range = this.range();
    return range ? this.texts.days(mimiDaysBetween(range.start, range.end)) : '';
  });

  protected isPreset(preset: MimiDateRangePreset): boolean {
    const range = this.range();
    return !!range && range.start === preset.range.start && range.end === preset.range.end;
  }

  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  protected pickDay(date: MimiDate): void {
    const start = this.startPick();
    if (start === null) {
      this.startPick.set(date);
      return;
    }
    this.startPick.set(null);
    this.value.set(date < start ? { start: date, end: start } : { start, end: date });
  }

  protected pickPreset(preset: MimiDateRangePreset): void {
    this.startPick.set(null);
    this.value.set({ ...preset.range });
  }

  protected onOpenChange(open: boolean): void {
    if (open) return;
    this.startPick.set(null);
    this.touch.emit();
  }
}
