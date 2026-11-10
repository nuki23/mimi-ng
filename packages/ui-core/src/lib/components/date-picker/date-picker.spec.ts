import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from '@/components/ui/calendar';
import { MIMI_TODAY, type MimiDate, mimiWeekday } from '@/components/ui/calendar/dates';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiDatePicker } from './date-picker';

@Component({
  imports: [MimiDatePicker, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <mimi-date-picker
      data-test="plain"
      aria-label="Fecha de entrega"
      placeholder="Elige una fecha"
      locale="es"
      [(value)]="date"
      [isDateDisabled]="weekend"
      [min]="min()"
      [disabled]="off()"
      [class]="extra()"
      [panelClass]="panelExtra()"
      (touch)="touches = touches + 1"
    />
    <mimi-date-picker data-test="english" aria-label="Date" locale="en-US" value="2026-09-30" />
    <mimi-form-field label="Reactive">
      <mimi-date-picker data-test="reactive" locale="es" [formControl]="control" />
    </mimi-form-field>
    <mimi-date-picker
      data-test="signal"
      aria-label="Signal"
      locale="es"
      [formField]="signalForm.date"
    />
    <mimi-date-picker
      data-test="ng-model"
      aria-label="Model"
      locale="es"
      name="d"
      [(ngModel)]="model"
    />
  `,
})
class Host {
  readonly date = signal<MimiDate | null>(null);
  readonly min = signal<MimiDate | null>(null);
  readonly off = signal(false);
  readonly extra = signal('');
  readonly panelExtra = signal('');
  touches = 0;
  readonly weekend = (date: MimiDate) => mimiWeekday(date) > 5;
  readonly control = new FormControl<MimiDate | null>(null, Validators.required);
  readonly locked = signal(false);
  readonly data = signal<{ date: MimiDate | null }>({ date: null });
  readonly signalForm = form(this.data, (p) => {
    required(p.date);
    disabled(p.date, () => this.locked());
  });
  readonly model = signal<MimiDate | null>('2026-09-01');
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
describe('MimiDatePicker', { timeout: 20_000 }, () => {
  beforeAll(() => {
    // jsdom no mide: el InteractivityChecker del CDK necesita geometría para el foco al abrir.
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
      root.querySelector<HTMLElement>(`mimi-date-picker[data-test="${id}"]`)!;
    const trigger = (id: string) => host(id).querySelector<HTMLButtonElement>('button')!;
    const panel = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel]');
    const cell = (date: MimiDate) => panel()!.querySelector<HTMLElement>(`[data-date="${date}"]`)!;
    const open = async (id: string) => {
      trigger(id).focus();
      trigger(id).click();
      await settle(fixture);
    };
    return { fixture, h: fixture.componentInstance, host, trigger, panel, cell, open };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('disparador: un botón con aria-haspopup="dialog", el placeholder y la caja de Input', async () => {
    const { trigger, host } = await setup();
    const button = trigger('plain');
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Fecha de entrega');
    expect(button.textContent?.trim()).toBe('Elige una fecha');
    expect(button.hasAttribute('data-placeholder')).toBe(true);
    expect(button.classList).toContain(
      'h-[var(--mimi-size-height,var(--mimi-control-height,2.5rem))]',
    );
    expect(button.classList).toContain('bg-input-background');
    // El valor describe al botón (con aria-label, el lector lo lee igual).
    const described = document.getElementById(button.getAttribute('aria-describedby')!);
    expect(described?.textContent?.trim()).toBe('Elige una fecha');
    expect(host('english').querySelector('button')!.textContent?.trim()).toBe('Sep 30, 2026');
  });

  it('abre un diálogo «Elegir fecha» con el foco en hoy; elegir cierra y devuelve el foco', async () => {
    const { h, fixture, trigger, panel, cell, open } = await setup();
    await open('plain');
    expect(panel()!.getAttribute('role')).toBe('dialog');
    expect(panel()!.getAttribute('aria-label')).toBe('Elegir fecha');
    expect(trigger('plain').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(cell('2026-09-15'));
    cell('2026-09-22').click();
    await settle(fixture);
    expect(h.date()).toBe('2026-09-22');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger('plain'));
    expect(trigger('plain').textContent?.trim()).toBe('22 sept 2026');
    expect(h.touches).toBe(1);
  });

  it('al abrir con una fecha elegida, el foco va a ese día; Escape cierra sin cambiar', async () => {
    const { h, fixture, trigger, panel, cell, open } = await setup();
    h.date.set('2026-10-07');
    await settle(fixture);
    await open('plain');
    expect(document.activeElement).toBe(cell('2026-10-07'));
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await settle(fixture);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger('plain'));
    expect(h.date()).toBe('2026-10-07');
  });

  it('teclado en la cuadrícula y Enter eligen; un día no disponible no', async () => {
    const { h, fixture, open } = await setup();
    await open('plain');
    const key = async (k: string) => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    await key('ArrowRight');
    await key('Enter');
    expect(h.date()).toBe('2026-09-16');
    await open('plain');
    await key('End');
    await key('Enter');
    // Domingo: no disponible.
    expect(h.date()).toBe('2026-09-16');
  });

  it('una fecha que llega del formulario fuera de min o no disponible se muestra igual', async () => {
    const { h, fixture, trigger } = await setup();
    h.min.set('2026-10-01');
    h.date.set('2026-09-26');
    await settle(fixture);
    expect(trigger('plain').textContent?.trim()).toBe('26 sept 2026');
    expect(h.date()).toBe('2026-09-26');
  });

  it('deshabilitado: el botón no abre', async () => {
    const { h, fixture, trigger, panel, host } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(trigger('plain').disabled).toBe(true);
    expect(host('plain').hasAttribute('data-disabled')).toBe(true);
    trigger('plain').click();
    await settle(fixture);
    expect(panel()).toBeNull();
  });

  it('class va al disparador y panelClass al panel', async () => {
    const { h, fixture, trigger, panel, open } = await setup();
    h.extra.set('rounded-none');
    h.panelExtra.set('p-6');
    await settle(fixture);
    expect(trigger('plain').classList).toContain('rounded-none');
    await open('plain');
    expect(panel()!.classList).toContain('p-6');
    expect(panel()!.className).not.toContain('p-[var(--mimi-date-padding,12px)]');
  });

  it('Reactive Forms: elige, error de requerido y tocado al cerrar', async () => {
    const { h, fixture, trigger, cell, open, host } = await setup();
    await open('reactive');
    cell('2026-09-17').click();
    await settle(fixture);
    expect(h.control.value).toBe('2026-09-17');
    expect(h.control.touched).toBe(true);
    h.control.setValue(null);
    await settle(fixture);
    expect(trigger('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(host('reactive').hasAttribute('data-invalid')).toBe(true);
    h.control.disable();
    await settle(fixture);
    expect(trigger('reactive').disabled).toBe(true);
  });

  it('Signal Forms y ngModel', async () => {
    const { h, fixture, trigger, cell, open } = await setup();
    expect(trigger('signal').getAttribute('aria-required')).toBe('true');
    await open('signal');
    cell('2026-09-18').click();
    await settle(fixture);
    expect(h.data().date).toBe('2026-09-18');
    h.locked.set(true);
    await settle(fixture);
    expect(trigger('signal').disabled).toBe(true);
    expect(trigger('ng-model').textContent?.trim()).toBe('1 sept 2026');
    await open('ng-model');
    cell('2026-09-02').click();
    await settle(fixture);
    expect(h.model()).toBe('2026-09-02');
  });
});
