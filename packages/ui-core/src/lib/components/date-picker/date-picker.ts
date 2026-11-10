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
import { type MimiDate, mimiFormatDate, mimiIsDate } from '@/components/ui/calendar/dates';
import { MimiPopover, MimiPopoverContent, MimiPopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import {
  controlInvalidStyles,
  controlPressStyles,
  fieldFocusStyles,
} from '@/components/ui/utils/control-styles';
import {
  MIMI_FIELD_CONTROL,
  type MimiFieldControl,
  injectFieldState,
} from '@/components/ui/utils/field-state';

/*
 * Date Picker (docs/design/Mimi F3 Combobox Fechas Hora.dc.html, «2 · Date Picker y Date
 * Range»; prefijo de tokens `date`, spec 13): un botón con la fecha que abre el calendario en un
 * Popover (`role="dialog"`). No se escribe la fecha a mano en la 0.3.0 (decidido por defecto en
 * la G2.9, como el diseño).
 */

/** El disparador: la caja de Input con un botón (los estados de Input, spec 13, «Campos»). */
export const MIMI_DATE_TRIGGER_CLASSES = cn(
  'flex h-[var(--mimi-size-height,var(--mimi-control-height,2.5rem))] w-full min-w-0 cursor-pointer items-center gap-2 px-3 text-left font-sans text-sm text-foreground',
  'rounded-[var(--mimi-radius,0.75rem)] border border-input bg-input-background not-disabled:hover:border-input-hover',
  'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
  fieldFocusStyles,
  controlInvalidStyles,
  controlPressStyles,
);

/** El panel del Popover con los tokens del calendario. */
export const MIMI_DATE_PANEL_CLASSES =
  'w-auto gap-2 p-[var(--mimi-date-padding,12px)] bg-[color:var(--mimi-date-menu-bg,var(--mimi-popover))] shadow-[shadow:var(--mimi-date-menu-shadow,var(--mimi-shadow-popover))]';

/** Formato del disparador por defecto: «30 sept 2026». */
const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

let nextId = 0;

/** `null` y la cadena vacía son «sin límite». */
const toDate = (value: unknown): MimiDate | undefined =>
  value === null || value === undefined || value === '' ? undefined : String(value);

/**
 * Date Picker:
 *
 * ```html
 * <mimi-date-picker aria-label="Fecha de entrega" [(value)]="fecha" [isDateDisabled]="finDeSemana" />
 * ```
 *
 * `value` es una fecha ISO (`'2026-09-30'`; `toMimiDate` y `fromMimiDate` convierten de y a
 * `Date`). Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y
 * `[(ngModel)]` (spec 8). `class` va al disparador y `panelClass` al panel.
 */
@Component({
  selector: 'mimi-date-picker',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [MimiPopover, MimiPopoverTrigger, MimiPopoverContent, MimiCalendar],
  providers: [{ provide: MIMI_FIELD_CONTROL, useExisting: MimiDatePicker }],
  template: `
    <mimi-popover
      align="start"
      [arrow]="false"
      [class]="panelClasses()"
      [(open)]="open"
      [blocked]="readonly()"
      (openChange)="onOpenChange($event)"
      aria-label="{{ texts.pickDate }}"
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
          <!-- Lucide calendar (ISC) -->
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M3 10h18" />
        </svg>
        <span
          class="min-w-0 flex-1 truncate tabular-nums"
          [class.text-muted-foreground]="!label()"
          [id]="valueId"
          >{{ label() || placeholder() }}</span
        >
      </button>
      <ng-template mimiPopoverContent>
        <mimi-calendar
          [value]="calendarValue()"
          [min]="min() ?? null"
          [max]="max() ?? null"
          [isDateDisabled]="isDateDisabled()"
          [locale]="lang()"
          [weekStart]="weekStart()"
          (datePick)="pick($event)"
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
export class MimiDatePicker implements FormValueControl<MimiDate | null>, MimiFieldControl {
  private readonly defaultLocale = inject(LOCALE_ID);
  protected readonly texts = inject(MIMI_DATE_PICKER_TEXT);

  /** La fecha elegida (`'2026-09-30'`), o `null`. Con `[(value)]` o un formulario. */
  readonly value = model<MimiDate | null>(null);
  /**
   * Primera y última fecha que se pueden elegir (incluidas). Tienen el tipo del valor (lo exige
   * `FormValueControl`). Con `[formField]`, Signal Forms no deja enlazarlas (NG8022): los límites
   * van en `isDateDisabled` y la validación, en el esquema (spec 8).
   */
  readonly min = input<MimiDate | undefined, unknown>(undefined, { transform: toDate });
  readonly max = input<MimiDate | undefined, unknown>(undefined, { transform: toDate });
  /** Fechas que no se pueden elegir (por ejemplo, los fines de semana). */
  readonly isDateDisabled = input<((date: MimiDate) => boolean) | null>(null);
  /** Idioma (nombres, formato y primer día de la semana). Por defecto, `LOCALE_ID`. */
  readonly locale = input<string>();
  /** Primer día de la semana (1 = lunes … 7 = domingo). Por defecto, el del idioma. */
  readonly weekStart = input<number>();
  /** Formato del disparador (opciones de `Intl.DateTimeFormat`). Por defecto, «30 sept 2026». */
  readonly format = input<Intl.DateTimeFormatOptions>(DEFAULT_FORMAT);
  readonly placeholder = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Solo lectura (R.12): el valor se ve y se puede enfocar, pero no cambia ni abre el panel. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Los pasa el formulario. Se muestra el error si es inválido y se tocó o modificó. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly dirty = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string>();
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del disparador, mezcladas con `cn()`. */
  readonly userClass = input('', { alias: 'class' });
  /** Clases del panel. */
  readonly panelClass = input('');

  /** Se cerró el panel: marca el control como tocado. */
  readonly touch = output<void>();

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly fieldState = injectFieldState();
  get controlElement(): HTMLElement {
    return this.trigger().nativeElement;
  }

  private readonly baseId = `mimi-date-picker-${nextId++}`;
  protected readonly controlId = computed(() => this.id() || this.baseId);
  protected readonly valueId = `${this.baseId}-value`;
  readonly showInvalid = computed(() => this.invalid() && (this.touched() || this.dirty()));

  protected readonly open = signal(false);
  protected readonly lang = computed(() => this.locale() || this.defaultLocale);
  protected readonly classes = computed(() => cn(MIMI_DATE_TRIGGER_CLASSES, this.userClass()));
  protected readonly panelClasses = computed(() => cn(MIMI_DATE_PANEL_CLASSES, this.panelClass()));

  /** Solo una fecha válida llega al calendario (un valor raro del formulario se muestra igual). */
  protected readonly calendarValue = computed(() => {
    const value = this.value();
    return mimiIsDate(value) ? value : null;
  });
  /**
   * Texto del disparador. El valor vive en Mimi (spec 4): una fecha fuera de `min`/`max` o no
   * disponible que llega del formulario se muestra igual; el formulario decide si es un error.
   */
  protected readonly label = computed(() => {
    const value = this.calendarValue();
    return value ? mimiFormatDate(value, this.lang(), this.format()) : '';
  });

  /** Enfoca el disparador. Lo usa Signal Forms para llevar el foco al campo con error. */
  focus(options?: FocusOptions): void {
    this.trigger().nativeElement.focus(options);
  }

  protected pick(date: MimiDate): void {
    this.value.set(date);
    this.setOpen(false);
  }

  /** Lo llama el Popover (clic, Escape, clic fuera). */
  protected onOpenChange(open: boolean): void {
    if (!open) this.touch.emit();
  }

  private setOpen(open: boolean): void {
    if (this.open() === open) return;
    this.open.set(open);
    if (!open) this.touch.emit();
  }
}
