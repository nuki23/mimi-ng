import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from '@/components/ui/calendar';
import { MIMI_TODAY, type MimiDate, type MimiDateRange } from '@/components/ui/calendar/dates';
import { type MimiDateRangePreset, MimiDateRangePicker } from './date-range';

@Component({
  imports: [MimiDateRangePicker, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <mimi-date-range
      data-test="plain"
      aria-label="Periodo del informe"
      placeholder="Elige un periodo"
      locale="es"
      maxDate="2026-09-20"
      [presets]="presets"
      [(value)]="range"
      [class]="extra()"
      (touch)="touches = touches + 1"
    />
    <mimi-date-range data-test="reactive" aria-label="R" locale="es" [formControl]="control" />
    <mimi-date-range data-test="signal" aria-label="S" locale="es" [formField]="signalForm.range" />
    <mimi-date-range data-test="ng-model" aria-label="M" locale="es" name="r" [(ngModel)]="model" />
  `,
})
class Host {
  readonly range = signal<MimiDateRange | null>(null);
  readonly extra = signal('');
  touches = 0;
  readonly presets: MimiDateRangePreset[] = [
    { label: 'Últimos 7 días', range: { start: '2026-09-09', end: '2026-09-15' } },
    { label: 'Este mes', range: { start: '2026-09-01', end: '2026-09-15' } },
  ];
  readonly control = new FormControl<MimiDateRange | null>(null, Validators.required);
  readonly data = signal<{ range: MimiDateRange | null }>({ range: null });
  readonly signalForm = form(this.data, (p) => required(p.range));
  readonly model = signal<MimiDateRange | null>({ start: '2026-09-01', end: '2026-09-03' });
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

// M.12: 20 s por prueba en esta suite (no los 5 s de Vitest). Abrir el panel la primera vez en
// cada archivo paga la primera creación de sus componentes: aislada tarda menos de 1 s, pero con
// `pnpm test` y todos los workers ocupados llegó a 6,8 s (05/11/2026; docs/plan/mantenimiento.md).
describe('MimiDateRangePicker', { timeout: 20_000 }, () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 10,
    });
  });
  afterAll(() => {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)['offsetWidth'];
  });

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
    const host = (id: string) =>
      root.querySelector<HTMLElement>(`mimi-date-range[data-test="${id}"]`)!;
    const trigger = (id: string) => host(id).querySelector<HTMLButtonElement>('button')!;
    const panel = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel]');
    const cell = (date: MimiDate) => panel()!.querySelector<HTMLElement>(`[data-date="${date}"]`)!;
    const help = () => panel()!.querySelector<HTMLElement>('[data-slot="help"]')!;
    const open = async (id: string) => {
      trigger(id).focus();
      trigger(id).click();
      await settle(fixture);
    };
    const click = async (date: MimiDate) => {
      cell(date).click();
      await settle(fixture);
    };
    const close = async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    return {
      fixture,
      h: fixture.componentInstance,
      host,
      trigger,
      panel,
      cell,
      help,
      open,
      click,
      close,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('dos clics eligen el periodo; el modelo cambia solo con los dos extremos', async () => {
    const { h, trigger, panel, cell, help, open, click } = await setup();
    expect(trigger('plain').textContent?.trim()).toBe('Elige un periodo');
    await open('plain');
    expect(panel()!.getAttribute('aria-label')).toBe('Elegir periodo');
    expect(document.activeElement).toBe(cell('2026-09-15'));
    expect(help().textContent?.trim()).toBe('Haz clic en un día para empezar un periodo nuevo.');
    await click('2026-09-14');
    expect(h.range()).toBeNull();
    expect(help().textContent?.trim()).toBe('Elige el día final.');
    expect(cell('2026-09-14').getAttribute('aria-selected')).toBe('true');
    await click('2026-09-18');
    expect(h.range()).toEqual({ start: '2026-09-14', end: '2026-09-18' });
    expect(cell('2026-09-16').parentElement!.className).toContain('--mimi-date-range');
    expect(trigger('plain').textContent).toContain('14 sept 2026 – 18 sept 2026');
    expect(trigger('plain').querySelector('[data-slot="days"]')!.textContent?.trim()).toBe(
      '5 días',
    );
    // La descripción del botón separa la fecha de los días.
    const description = document.getElementById(trigger('plain').getAttribute('aria-describedby')!);
    expect(description!.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '14 sept 2026 – 18 sept 2026, 5 días',
    );
  });

  it('si el segundo es anterior al inicio, se intercambian; un tercero empieza otro', async () => {
    const { h, open, click } = await setup();
    await open('plain');
    await click('2026-09-12');
    await click('2026-09-03');
    expect(h.range()).toEqual({ start: '2026-09-03', end: '2026-09-12' });
    await click('2026-09-07');
    expect(h.range()).toEqual({ start: '2026-09-03', end: '2026-09-12' });
    await click('2026-09-08');
    expect(h.range()).toEqual({ start: '2026-09-07', end: '2026-09-08' });
  });

  it('maxDate: los días posteriores no se eligen', async () => {
    const { h, cell, open, click } = await setup();
    await open('plain');
    expect(cell('2026-09-21').getAttribute('aria-disabled')).toBe('true');
    await click('2026-09-10');
    await click('2026-09-25');
    expect(h.range()).toBeNull();
  });

  it('atajos: aria-pressed en el que coincide con el valor', async () => {
    const { h, panel, open, fixture } = await setup();
    await open('plain');
    const presets = () =>
      Array.from(panel()!.querySelectorAll<HTMLButtonElement>('[data-slot="presets"] button'));
    expect(presets().map((p) => p.textContent?.trim())).toEqual(['Últimos 7 días', 'Este mes']);
    presets()[1].click();
    await settle(fixture);
    expect(h.range()).toEqual({ start: '2026-09-01', end: '2026-09-15' });
    expect(presets()[1].getAttribute('aria-pressed')).toBe('true');
    expect(presets()[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('cerrar con solo el inicio lo descarta y marca tocado; el foco vuelve al botón', async () => {
    const { h, trigger, open, click, close } = await setup();
    await open('plain');
    await click('2026-09-10');
    await close();
    expect(h.range()).toBeNull();
    expect(h.touches).toBe(1);
    expect(document.activeElement).toBe(trigger('plain'));
  });

  it('sin atajos no hay columna; class va al botón', async () => {
    const { h, fixture, trigger, panel, open } = await setup();
    h.extra.set('rounded-none');
    await settle(fixture);
    expect(trigger('plain').classList).toContain('rounded-none');
    await open('reactive');
    expect(panel()!.querySelector('[data-slot="presets"]')).toBeNull();
  });

  it('Reactive Forms, Signal Forms y ngModel', async () => {
    const { h, fixture, trigger, open, click, close } = await setup();
    await open('reactive');
    await click('2026-09-01');
    await click('2026-09-02');
    expect(h.control.value).toEqual({ start: '2026-09-01', end: '2026-09-02' });
    await close();
    expect(h.control.touched).toBe(true);
    h.control.setValue(null);
    await settle(fixture);
    expect(trigger('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(trigger('signal').getAttribute('aria-required')).toBe('true');
    await open('signal');
    await click('2026-09-05');
    await click('2026-09-04');
    expect(h.data().range).toEqual({ start: '2026-09-04', end: '2026-09-05' });
    await close();
    expect(trigger('ng-model').textContent).toContain('1 sept 2026 – 3 sept 2026');
    expect(trigger('ng-model').textContent).toContain('3 días');
  });
});
