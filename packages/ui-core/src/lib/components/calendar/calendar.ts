import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MIMI_DATE_PICKER_TEXT } from './calendar-texts';
import {
  MIMI_TODAY,
  type MimiDate,
  mimiAddDays,
  mimiAddMonths,
  mimiFormatDate,
  mimiStartOfMonth,
  mimiWeekStart,
  mimiWeekday,
} from './dates';

/*
 * Calendario (docs/design/Mimi F3 Combobox Fechas Hora.dc.html, «2 · Date Picker y Date Range»;
 * prefijo de tokens `date`, spec 13). Lo usan el Date Picker y el Date Range, y se puede usar
 * suelto. Cuadrícula propia con el teclado de la APG («Date Picker Dialog»; decidido por defecto
 * en la G2.9: la `ngGrid` de aria no da Re Pág/Av Pág ni el paso de mes en los bordes). Los
 * nombres de meses y días salen de `Intl.DateTimeFormat` con el idioma.
 */

/** Vista del calendario. */
export type MimiCalendarView = 'days' | 'months' | 'years';

interface Day {
  date: MimiDate;
  day: number;
  inMonth: boolean;
  today: boolean;
  disabled: boolean;
  selected: boolean;
  /** Banda del rango: 'start', 'end', 'both', 'middle' o null. */
  band: 'start' | 'end' | 'both' | 'middle' | null;
  label: string;
}

const ICON = {
  viewBox: '0 0 24 24',
  left: 'm15 18-6-6 6-6',
  right: 'm9 18 6-6-6-6',
  down: 'm6 9 6 6 6-6',
} as const;

const NAV_CLASSES = cn(
  'inline-flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--mimi-radius-sm)] border border-border bg-transparent text-foreground [&_svg]:size-4',
  'mimi-transition hover:bg-accent active:scale-90',
  buttonFocusStyles,
);
const TITLE_BUTTON_CLASSES = cn(
  'inline-flex h-[30px] cursor-pointer items-center gap-1 rounded-[var(--mimi-radius-sm)] border-0 bg-transparent px-2.5 text-sm font-semibold text-foreground [&_svg]:size-3.5',
  'mimi-transition hover:bg-accent active:scale-[0.96]',
  buttonFocusStyles,
);
const CELL_BASE = cn(
  'relative inline-flex size-[var(--mimi-date-cell-size,36px)] cursor-pointer items-center justify-center text-[13.5px] tabular-nums select-none',
  'rounded-[var(--mimi-date-cell-radius,var(--mimi-radius-sm))] mimi-transition active:scale-90',
  buttonFocusStyles,
);
/** Clases de cada estado del día, elegidas en TypeScript (spec 10: sin variantes encadenadas). */
const CELL = {
  selected: cn(
    CELL_BASE,
    'bg-[color:var(--mimi-date-selected-bg,var(--mimi-primary))] font-semibold text-[color:var(--mimi-date-selected-fg,var(--mimi-primary-foreground))]',
  ),
  day: cn(
    CELL_BASE,
    'text-foreground hover:bg-[color:var(--mimi-date-cell-hover,var(--mimi-accent))]',
  ),
  outside: cn(
    CELL_BASE,
    'text-muted-foreground opacity-55 hover:bg-[color:var(--mimi-date-cell-hover,var(--mimi-accent))]',
  ),
  disabled: cn(
    CELL_BASE,
    'cursor-not-allowed text-foreground line-through opacity-[.38] active:scale-100',
  ),
  disabledOutside: cn(
    CELL_BASE,
    'cursor-not-allowed text-muted-foreground opacity-[.38] active:scale-100',
  ),
} as const;
const TODAY_CLASSES =
  'font-semibold shadow-[shadow:inset_0_0_0_1px_var(--mimi-date-today-ring,var(--mimi-border))]';
const BAND = {
  none: 'flex justify-center',
  middle:
    'flex justify-center bg-[color:var(--mimi-date-range,var(--mimi-range,var(--mimi-accent)))]',
  start:
    'flex justify-center rounded-s-[var(--mimi-date-cell-radius,var(--mimi-radius-sm))] bg-[color:var(--mimi-date-range,var(--mimi-range,var(--mimi-accent)))]',
  end: 'flex justify-center rounded-e-[var(--mimi-date-cell-radius,var(--mimi-radius-sm))] bg-[color:var(--mimi-date-range,var(--mimi-range,var(--mimi-accent)))]',
  both: 'flex justify-center',
} as const;
const PICK_BASE = cn(
  'h-11 cursor-pointer rounded-[var(--mimi-radius-sm)] border-0 text-sm tabular-nums mimi-transition hover:shadow-[shadow:inset_0_0_0_1px_var(--mimi-border)] active:scale-[0.94]',
  buttonFocusStyles,
);
const PICK = {
  on: cn(PICK_BASE, 'bg-primary font-semibold text-primary-foreground'),
  off: cn(PICK_BASE, 'bg-transparent text-foreground'),
} as const;

let nextId = 0;

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

/**
 * Calendario de un mes, con vistas de meses y años:
 *
 * ```html
 * <mimi-calendar [(value)]="fecha" [min]="hoy" [isDateDisabled]="esFinDeSemana" />
 * ```
 *
 * `value` es una fecha ISO (`'2026-09-30'`, tipo `MimiDate`). Con `mode="range"` pinta el periodo
 * de `rangeStart` a `rangeEnd` y solo avisa con `(datePick)` (lo usa el Date Range).
 */
@Component({
  selector: 'mimi-calendar',
  template: `
    <div class="flex items-center justify-between gap-2">
      <button
        type="button"
        [class]="navClasses"
        [attr.aria-label]="texts.previous"
        (click)="move(-1)"
      >
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.viewBox]="icon.viewBox"
        >
          <path [attr.d]="icon.left" />
        </svg>
      </button>
      @if (mode() === 'single') {
        <button
          type="button"
          data-slot="title"
          [id]="titleId"
          [class]="titleButtonClasses"
          [attr.aria-label]="title() + ', ' + texts.changeView"
          (click)="cycleView()"
        >
          {{ title() }}
          <svg
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path [attr.d]="icon.down" />
          </svg>
        </button>
      } @else {
        <span data-slot="title" class="text-sm font-semibold" [id]="titleId">{{ title() }}</span>
      }
      <button type="button" [class]="navClasses" [attr.aria-label]="texts.next" (click)="move(1)">
        <svg
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.viewBox]="icon.viewBox"
        >
          <path [attr.d]="icon.right" />
        </svg>
      </button>
    </div>
    <!-- El cambio de mes, año o vista se anuncia. -->
    <span class="sr-only" aria-live="polite">{{ title() }}</span>

    @switch (view()) {
      @case ('days') {
        <div
          role="grid"
          class="grid grid-cols-[repeat(7,var(--mimi-date-cell-size,36px))] gap-y-0.5"
          [attr.aria-labelledby]="titleId"
          (keydown)="onGridKeydown($event)"
        >
          <div role="row" class="contents">
            @for (weekday of weekdays(); track $index) {
              <span
                role="columnheader"
                class="flex h-7 items-center justify-center text-xs font-medium text-muted-foreground"
                [attr.aria-label]="weekday.long"
                >{{ weekday.short }}</span
              >
            }
          </div>
          @for (week of weeks(); track week[0].date) {
            <div role="row" class="contents">
              @for (day of week; track day.date) {
                <div [class]="bandClasses[day.band ?? 'none']">
                  <div
                    role="gridcell"
                    [attr.data-date]="day.date"
                    [attr.tabindex]="day.date === active() ? 0 : -1"
                    [attr.autofocus]="day.date === active() ? '' : null"
                    [attr.aria-label]="day.label"
                    [attr.aria-selected]="day.selected"
                    [attr.aria-current]="day.today ? 'date' : null"
                    [attr.aria-disabled]="day.disabled || null"
                    [attr.data-outside]="day.inMonth ? null : ''"
                    [class]="cellClasses(day)"
                    (focus)="active.set(day.date)"
                    (click)="pickDay(day)"
                  >
                    {{ day.day }}
                    @if (day.today) {
                      <span
                        aria-hidden="true"
                        class="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
                      ></span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
      @case ('months') {
        <div class="grid w-[252px] grid-cols-3 gap-1.5">
          @for (month of months(); track month.date) {
            <button
              type="button"
              [class]="month.on ? pickOn : pickOff"
              [attr.aria-pressed]="month.on"
              [attr.data-active]="month.active ? '' : null"
              (click)="pickMonth(month.date)"
            >
              {{ month.label }}
            </button>
          }
        </div>
      }
      @case ('years') {
        <div class="grid w-[252px] grid-cols-3 gap-1.5">
          @for (year of years(); track year.year) {
            <button
              type="button"
              [class]="year.on ? pickOn : pickOff"
              [attr.aria-pressed]="year.on"
              [attr.data-active]="year.active ? '' : null"
              (click)="pickYear(year.year)"
            >
              {{ year.year }}
            </button>
          }
        </div>
      }
    }

    @if (mode() === 'single') {
      <div class="flex items-center justify-between border-t border-border pt-2">
        <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span aria-hidden="true" class="size-1 rounded-full bg-current"></span>{{ texts.today }}
        </span>
        <button
          type="button"
          data-slot="go-today"
          class="h-7 cursor-pointer rounded-[var(--mimi-radius-sm)] border border-border bg-transparent px-2.5 text-[12.5px] font-medium text-foreground mimi-transition hover:bg-accent active:scale-[0.94]"
          [class]="focusClasses"
          (click)="goToday()"
        >
          {{ texts.goToday }}
        </button>
      </div>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-view]': 'view()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiCalendar {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly dir = inject(Directionality, { optional: true });
  private readonly defaultLocale = inject(LOCALE_ID);
  private readonly todayFn = inject(MIMI_TODAY);
  protected readonly texts = inject(MIMI_DATE_PICKER_TEXT);

  /** La fecha elegida (`'2026-09-30'`), o `null`. Con `[(value)]`. */
  readonly value = model<MimiDate | null>(null);
  /** `single` elige una fecha; `range` pinta el periodo de `rangeStart` a `rangeEnd`. */
  readonly mode = input<'single' | 'range'>('single');
  readonly rangeStart = input<MimiDate | null>(null);
  readonly rangeEnd = input<MimiDate | null>(null);
  /** Primera y última fecha que se pueden elegir (incluidas). */
  readonly min = input<MimiDate | null>(null);
  readonly max = input<MimiDate | null>(null);
  /** Fechas que no se pueden elegir (por ejemplo, los fines de semana). */
  readonly isDateDisabled = input<((date: MimiDate) => boolean) | null>(null);
  /** Idioma (nombres y primer día de la semana). Por defecto, `LOCALE_ID`. */
  readonly locale = input<string>();
  /** Primer día de la semana (1 = lunes … 7 = domingo). Por defecto, el del idioma. */
  readonly weekStart = input<number>();
  readonly userClass = input('', { alias: 'class' });

  /** Se eligió un día habilitado (con el puntero, Enter o Espacio). */
  readonly datePick = output<MimiDate>();

  protected readonly icon = ICON;
  protected readonly navClasses = NAV_CLASSES;
  protected readonly titleButtonClasses = TITLE_BUTTON_CLASSES;
  protected readonly bandClasses = BAND;
  protected readonly pickOn = PICK.on;
  protected readonly pickOff = PICK.off;
  protected readonly focusClasses = buttonFocusStyles;
  protected readonly titleId = `mimi-calendar-${nextId++}-title`;

  protected readonly classes = computed(() =>
    cn('inline-flex flex-col gap-2 font-sans text-foreground', this.userClass()),
  );

  private readonly lang = computed(() => this.locale() || this.defaultLocale);
  private readonly firstDay = computed(() => this.weekStart() ?? mimiWeekStart(this.lang()));
  protected readonly today = computed(() => this.todayFn());

  /** Vista actual. */
  readonly view = signal<MimiCalendarView>('days');
  /** Día con el foco (la parada de Tab de la cuadrícula). Sigue a la fecha elegida o a hoy. */
  protected readonly active = linkedSignal<MimiDate>(
    () => this.value() ?? this.rangeStart() ?? this.today(),
  );
  /** Primer día del mes que se ve. */
  protected readonly month = linkedSignal(() => mimiStartOfMonth(this.active()));

  private readonly year = computed(() => +this.month().slice(0, 4));

  protected readonly title = computed(() => {
    const view = this.view();
    if (view === 'years') {
      const start = this.year() - (this.year() % 12);
      return `${start}–${start + 11}`;
    }
    if (view === 'months') return String(this.year());
    return capitalize(
      mimiFormatDate(this.month(), this.lang(), { month: 'long', year: 'numeric' }),
    );
  });

  protected readonly weekdays = computed(() => {
    // 2024-01-01 fue lunes: el día ISO n es 2024-01-0n.
    const first = this.firstDay();
    return Array.from({ length: 7 }, (_, i) => {
      const weekday = ((first - 1 + i) % 7) + 1;
      const date = mimiAddDays('2024-01-01', weekday - 1);
      return {
        short: mimiFormatDate(date, this.lang(), { weekday: 'narrow' }),
        long: mimiFormatDate(date, this.lang(), { weekday: 'long' }),
      };
    });
  });

  /** `true` si la fecha no se puede elegir. */
  isDisabled(date: MimiDate): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && date < min) || (!!max && date > max) || !!this.isDateDisabled()?.(date);
  }

  /** Seis semanas desde el primer día de la semana que contiene el día 1. */
  protected readonly weeks = computed<Day[][]>(() => {
    const month = this.month();
    const offset = (mimiWeekday(month) - this.firstDay() + 7) % 7;
    const first = mimiAddDays(month, -offset);
    const today = this.today();
    const value = this.value();
    const single = this.mode() === 'single';
    const start = this.rangeStart();
    const end = this.rangeEnd();
    const lang = this.lang();
    const weeks: Day[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: Day[] = [];
      for (let d = 0; d < 7; d++) {
        const date = mimiAddDays(first, w * 7 + d);
        const disabled = this.isDisabled(date);
        const isStart = !single && date === start;
        const isEnd = !single && date === end;
        const band =
          single || !start || !end || start === end
            ? null
            : isStart
              ? 'start'
              : isEnd
                ? 'end'
                : date > start && date < end
                  ? 'middle'
                  : null;
        const label = mimiFormatDate(date, lang, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        week.push({
          date,
          day: +date.slice(8),
          inMonth: date.slice(0, 7) === month.slice(0, 7),
          today: date === today,
          disabled,
          selected: single ? date === value : isStart || isEnd,
          band,
          label: disabled ? `${label}, ${this.texts.unavailable}` : label,
        });
      }
      weeks.push(week);
    }
    return weeks;
  });

  protected readonly months = computed(() => {
    const year = this.year();
    const value = this.value();
    const lang = this.lang();
    return Array.from({ length: 12 }, (_, i) => {
      const date = `${String(year).padStart(4, '0')}-${String(i + 1).padStart(2, '0')}-01`;
      return {
        date,
        label: capitalize(mimiFormatDate(date, lang, { month: 'short' }).replace('.', '')),
        on: !!value && value.slice(0, 7) === date.slice(0, 7),
        active: date.slice(0, 7) === this.month().slice(0, 7),
      };
    });
  });

  protected readonly years = computed(() => {
    const start = this.year() - (this.year() % 12);
    const selected = this.value() ? +this.value()!.slice(0, 4) : null;
    return Array.from({ length: 12 }, (_, i) => ({
      year: start + i,
      on: start + i === selected,
      active: start + i === this.year(),
    }));
  });

  protected cellClasses(day: Day): string {
    const state = day.selected
      ? CELL.selected
      : day.disabled
        ? day.inMonth
          ? CELL.disabled
          : CELL.disabledOutside
        : day.inMonth
          ? CELL.day
          : CELL.outside;
    return day.today && !day.selected ? cn(state, TODAY_CLASSES) : state;
  }

  /** Mes, año o página de años anterior (-1) o siguiente (1). */
  protected move(step: number): void {
    const view = this.view();
    const months = view === 'days' ? step : view === 'months' ? step * 12 : step * 144;
    this.month.set(mimiAddMonths(this.month(), months));
    if (view === 'days') this.active.set(mimiAddMonths(this.active(), step));
  }

  protected cycleView(): void {
    const next: Record<MimiCalendarView, MimiCalendarView> = {
      days: 'months',
      months: 'years',
      years: 'days',
    };
    this.view.set(next[this.view()]);
    this.focusActive();
  }

  protected pickMonth(date: MimiDate): void {
    this.month.set(date);
    this.active.set(mimiStartOfMonth(date));
    this.view.set('days');
    this.focusActive();
  }

  protected pickYear(year: number): void {
    this.month.set(`${String(year).padStart(4, '0')}${this.month().slice(4)}`);
    this.view.set('months');
    this.focusActive();
  }

  protected pickDay(day: Day): void {
    this.active.set(day.date);
    if (day.disabled) return;
    if (this.mode() === 'single') this.value.set(day.date);
    if (!day.inMonth) this.month.set(mimiStartOfMonth(day.date));
    this.datePick.emit(day.date);
  }

  /** Lleva la vista al mes de hoy y el foco a hoy. */
  goToday(): void {
    this.view.set('days');
    this.active.set(this.today());
    this.month.set(mimiStartOfMonth(this.today()));
    this.focusActive();
  }

  /** Teclado de la APG en la cuadrícula. */
  protected onGridKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const rtl = this.dir?.value === 'rtl';
    const active = this.active();
    let next: MimiDate | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = mimiAddDays(active, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        next = mimiAddDays(active, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        next = mimiAddDays(active, -7);
        break;
      case 'ArrowDown':
        next = mimiAddDays(active, 7);
        break;
      case 'Home':
        next = mimiAddDays(active, -((mimiWeekday(active) - this.firstDay() + 7) % 7));
        break;
      case 'End':
        next = mimiAddDays(active, 6 - ((mimiWeekday(active) - this.firstDay() + 7) % 7));
        break;
      case 'PageUp':
        next = mimiAddMonths(active, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = mimiAddMonths(active, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const day = this.weeks()
          .flat()
          .find((d) => d.date === active);
        if (day) this.pickDay(day);
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    this.active.set(next);
    if (next.slice(0, 7) !== this.month().slice(0, 7)) this.month.set(mimiStartOfMonth(next));
    this.focusActive();
  }

  /** Lleva el foco al día activo (o al mes o año activo en esas vistas) después de pintar. */
  focusActive(): void {
    afterNextRender(
      {
        write: () => {
          const target = this.host.querySelector<HTMLElement>(
            '[role="gridcell"][tabindex="0"], [data-active]',
          );
          (target ?? this.host.querySelector<HTMLElement>('[data-slot="title"]'))?.focus();
        },
      },
      { injector: this.injector },
    );
  }
}
