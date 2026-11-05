import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCalendar } from './calendar';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from './calendar-texts';
import {
  MIMI_TODAY,
  type MimiDate,
  fromMimiDate,
  mimiAddDays,
  mimiAddMonths,
  mimiDaysBetween,
  mimiFormatDate,
  mimiIsDate,
  mimiWeekStart,
  mimiWeekday,
  toMimiDate,
} from './dates';

@Component({
  imports: [MimiCalendar],
  template: `
    <mimi-calendar
      [(value)]="value"
      [locale]="locale()"
      [min]="min()"
      [max]="max()"
      [isDateDisabled]="weekend"
      [mode]="mode()"
      [rangeStart]="start()"
      [rangeEnd]="end()"
      [class]="extra()"
      (datePick)="picks.push($event)"
    />
  `,
})
class Host {
  readonly value = signal<MimiDate | null>('2026-09-30');
  readonly locale = signal('es');
  readonly min = signal<MimiDate | null>(null);
  readonly max = signal<MimiDate | null>(null);
  readonly mode = signal<'single' | 'range'>('single');
  readonly start = signal<MimiDate | null>(null);
  readonly end = signal<MimiDate | null>(null);
  readonly extra = signal('');
  readonly picks: MimiDate[] = [];
  readonly weekend = (date: MimiDate) => mimiWeekday(date) > 5;
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('fechas de Mimi (dates.ts)', () => {
  it('valida fechas ISO y suma días y meses sin cambiar de día', () => {
    expect(mimiIsDate('2026-09-30')).toBe(true);
    expect(mimiIsDate('2026-02-30')).toBe(false);
    expect(mimiIsDate('30/09/2026')).toBe(false);
    expect(mimiAddDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(mimiAddDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(mimiAddMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(mimiAddMonths('2026-12-15', 1)).toBe('2027-01-15');
    expect(mimiDaysBetween('2026-09-24', '2026-09-30')).toBe(7);
    expect(mimiWeekday('2026-09-30')).toBe(3);
  });

  it('sin errores de un día: el mismo instante es otro día al este y al oeste de UTC', () => {
    // 30/09/2026 23:30 UTC: ya es 1 de octubre en Kiribati (+14) y sigue siendo 30 en Samoa (−11).
    const instant = new Date(Date.UTC(2026, 8, 30, 23, 30));
    expect(toMimiDate(instant, 'Pacific/Kiritimati')).toBe('2026-10-01');
    expect(toMimiDate(instant, 'Pacific/Pago_Pago')).toBe('2026-09-30');
    expect(toMimiDate(instant, 'UTC')).toBe('2026-09-30');
    // Sin zona: el día local, a cualquier hora del día.
    expect(toMimiDate(new Date(2026, 8, 30, 0, 0))).toBe('2026-09-30');
    expect(toMimiDate(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30');
    expect(toMimiDate(fromMimiDate('2026-09-30'))).toBe('2026-09-30');
    // El formato no depende de la zona horaria del equipo.
    expect(mimiFormatDate('2026-09-30', 'en-US', { day: 'numeric', month: 'long' })).toBe(
      'September 30',
    );
  });

  it('primer día de la semana por idioma: lunes en es, domingo en en-US', () => {
    expect(mimiWeekStart('es')).toBe(1);
    expect(mimiWeekStart('es-ES')).toBe(1);
    expect(mimiWeekStart('en-US')).toBe(7);
  });
});

describe('MimiCalendar', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideMimiDatePickerText(MIMI_DATE_PICKER_TEXT_ES),
        { provide: MIMI_TODAY, useValue: () => '2026-09-15' },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector<HTMLElement>('mimi-calendar')!;
    const cell = (date: MimiDate) => host.querySelector<HTMLElement>(`[data-date="${date}"]`)!;
    const cells = () => Array.from(host.querySelectorAll<HTMLElement>('[role="gridcell"]'));
    const title = () => host.querySelector<HTMLElement>('[data-slot="title"]')!;
    const grid = () => host.querySelector<HTMLElement>('[role="grid"]')!;
    const press = async (k: string, init: KeyboardEventInit = {}) => {
      (document.activeElement ?? grid()).dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
      );
      await settle(fixture);
    };
    return { fixture, h: fixture.componentInstance, host, cell, cells, title, grid, press };
  }

  it('cuadrícula de 6 semanas desde el lunes (es), con los días de la semana del idioma', async () => {
    const { host, cells, title, grid } = await setup();
    expect(cells().length).toBe(42);
    expect(cells()[0].dataset['date']).toBe('2026-08-31');
    expect(title().textContent?.trim()).toBe('Septiembre de 2026');
    const headers = Array.from(host.querySelectorAll('[role="columnheader"]'));
    expect(headers.map((h) => h.textContent?.trim())).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(headers[0].getAttribute('aria-label')).toBe('lunes');
    expect(grid().getAttribute('aria-labelledby')).toBe(title().id);
  });

  it('en-US: la semana empieza el domingo y los nombres en inglés', async () => {
    const { h, fixture, cells, title, host } = await setup();
    h.locale.set('en-US');
    await settle(fixture);
    expect(cells()[0].dataset['date']).toBe('2026-08-30');
    expect(title().textContent?.trim()).toBe('September 2026');
    expect(host.querySelector('[role="columnheader"]')!.getAttribute('aria-label')).toBe('Sunday');
  });

  it('el elegido, hoy, los de otro mes y los no disponibles', async () => {
    const { cell } = await setup();
    const selected = cell('2026-09-30');
    expect(selected.getAttribute('aria-selected')).toBe('true');
    expect(selected.getAttribute('aria-label')).toBe('30 de septiembre de 2026');
    expect(selected.getAttribute('tabindex')).toBe('0');
    expect(selected.hasAttribute('autofocus')).toBe(true);
    const today = cell('2026-09-15');
    expect(today.getAttribute('aria-current')).toBe('date');
    expect(today.className).toContain(
      'shadow-[shadow:inset_0_0_0_1px_var(--mimi-date-today-ring,var(--mimi-border))]',
    );
    const weekend = cell('2026-09-26');
    expect(weekend.getAttribute('aria-disabled')).toBe('true');
    expect(weekend.getAttribute('aria-label')).toBe('26 de septiembre de 2026, no disponible');
    expect(weekend.classList).toContain('line-through');
    expect(cell('2026-08-31').hasAttribute('data-outside')).toBe(true);
    expect(cell('2026-09-01').getAttribute('tabindex')).toBe('-1');
  });

  it('clic elige un día habilitado y emite datePick; en uno no disponible, no', async () => {
    const { h, fixture, cell } = await setup();
    cell('2026-09-26').click();
    await settle(fixture);
    expect(h.value()).toBe('2026-09-30');
    expect(h.picks).toEqual([]);
    cell('2026-09-22').click();
    await settle(fixture);
    expect(h.value()).toBe('2026-09-22');
    expect(h.picks).toEqual(['2026-09-22']);
  });

  it('teclado de la APG: flechas, Inicio/Fin, Re Pág/Av Pág (con Mayús, un año) y Enter', async () => {
    const { h, cell, press, title } = await setup();
    cell('2026-09-30').focus();
    await press('ArrowLeft');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-09-29');
    await press('ArrowDown');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-06');
    // Pasó al mes siguiente y lo anuncia el título.
    expect(title().textContent?.trim()).toBe('Octubre de 2026');
    await press('Home');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-05');
    await press('End');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-10-11');
    await press('PageUp');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-09-11');
    await press('PageDown', { shiftKey: true });
    expect(document.activeElement?.getAttribute('data-date')).toBe('2027-09-11');
    await press('ArrowLeft');
    await press('Enter');
    expect(h.value()).toBe('2027-09-10');
    // Una sola parada de Tab en la cuadrícula.
    expect(document.querySelectorAll('[role="gridcell"][tabindex="0"]').length).toBe(1);
  });

  it('el foco puede pasar por un día no disponible, pero Enter no lo elige', async () => {
    const { h, cell, press } = await setup();
    cell('2026-09-25').focus();
    await press('ArrowRight');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-09-26');
    await press('Enter');
    expect(h.value()).toBe('2026-09-30');
  });

  it('min y max deshabilitan los días de fuera', async () => {
    const { h, fixture, cell } = await setup();
    h.min.set('2026-09-10');
    h.max.set('2026-09-20');
    await settle(fixture);
    expect(cell('2026-09-09').getAttribute('aria-disabled')).toBe('true');
    expect(cell('2026-09-10').hasAttribute('aria-disabled')).toBe(false);
    expect(cell('2026-09-21').getAttribute('aria-disabled')).toBe('true');
  });

  it('anterior y siguiente cambian de mes; el título cambia de vista: meses y años', async () => {
    const { h, fixture, host, title } = await setup();
    const [prev, , next] = Array.from(host.querySelectorAll<HTMLButtonElement>('button'));
    expect(prev.getAttribute('aria-label')).toBe('Anterior');
    next.click();
    await settle(fixture);
    expect(title().textContent?.trim()).toBe('Octubre de 2026');
    prev.click();
    prev.click();
    await settle(fixture);
    expect(title().textContent?.trim()).toBe('Agosto de 2026');
    expect(title().getAttribute('aria-label')).toBe('Agosto de 2026, Cambiar vista');
    title().click();
    await settle(fixture);
    expect(host.dataset['view']).toBe('months');
    const months = Array.from(host.querySelectorAll<HTMLButtonElement>('[aria-pressed]'));
    expect(months.length).toBe(12);
    expect(months[8].getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(months[7]);
    title().click();
    await settle(fixture);
    expect(host.dataset['view']).toBe('years');
    expect(title().textContent?.trim()).toBe('2016–2027');
    const years = Array.from(host.querySelectorAll<HTMLButtonElement>('[aria-pressed]'));
    years.find((y) => y.textContent?.trim() === '2025')!.click();
    await settle(fixture);
    expect(host.dataset['view']).toBe('months');
    Array.from(host.querySelectorAll<HTMLButtonElement>('[aria-pressed]'))[2].click();
    await settle(fixture);
    expect(host.dataset['view']).toBe('days');
    expect(title().textContent?.trim()).toBe('Marzo de 2025');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2025-03-01');
    expect(h.value()).toBe('2026-09-30');
  });

  it('«Ir a hoy» vuelve al mes de hoy y lleva el foco a hoy', async () => {
    const { fixture, host, title } = await setup();
    host.querySelector<HTMLButtonElement>('button[aria-label="Siguiente"]')!.click();
    await settle(fixture);
    host.querySelector<HTMLButtonElement>('[data-slot="go-today"]')!.click();
    await settle(fixture);
    expect(title().textContent?.trim()).toBe('Septiembre de 2026');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-09-15');
  });

  it('modo range: pinta la banda con los extremos, sin la vista ni el pie', async () => {
    const { h, fixture, host, cell } = await setup();
    h.mode.set('range');
    h.start.set('2026-09-14');
    h.end.set('2026-09-18');
    await settle(fixture);
    expect(cell('2026-09-14').getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-09-18').getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-09-16').getAttribute('aria-selected')).toBe('false');
    expect(cell('2026-09-16').parentElement!.className).toContain('--mimi-date-range');
    expect(cell('2026-09-14').parentElement!.className).toContain('rounded-s-');
    expect(cell('2026-09-18').parentElement!.className).toContain('rounded-e-');
    expect(cell('2026-09-20').parentElement!.className).not.toContain('--mimi-date-range');
    expect(host.querySelector('button[data-slot="title"]')).toBeNull();
    expect(host.querySelector('[data-slot="go-today"]')).toBeNull();
    cell('2026-09-22').click();
    await settle(fixture);
    expect(h.picks).toEqual(['2026-09-22']);
    expect(h.value()).toBe('2026-09-30');
  });

  it('acepta class', async () => {
    const { h, fixture, host } = await setup();
    h.extra.set('gap-4');
    await settle(fixture);
    expect(host.classList).toContain('gap-4');
    expect(host.classList).not.toContain('gap-2');
  });
});
