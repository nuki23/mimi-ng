import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiCombobox } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiSelect } from '@/components/ui/select';
import { MimiSwitch } from '@/components/ui/switch';

/**
 * R.12: `readonly` en los controles de formulario que no lo tenían. Como el `readonly` de un
 * `<input>`: el valor se ve, se puede enfocar, **no se puede cambiar** y no se abre su panel.
 */
@Component({
  imports: [
    MimiCheckbox,
    MimiCombobox,
    MimiDatePicker,
    MimiDateRangePicker,
    MimiSelect,
    MimiSwitch,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-checkbox data-test="checkbox" [(checked)]="on" [readonly]="ro()">Casilla</mimi-checkbox>
    <mimi-switch data-test="switch" [(checked)]="on2" [readonly]="ro()">Interruptor</mimi-switch>
    <mimi-select
      data-test="select"
      aria-label="s"
      [options]="options"
      [(value)]="sel"
      [readonly]="ro()"
    />
    <mimi-combobox
      data-test="combobox"
      aria-label="c"
      [options]="options"
      [(value)]="com"
      [readonly]="ro()"
    />
    <mimi-date-picker data-test="date" aria-label="d" [(value)]="date" [readonly]="ro()" />
    <mimi-date-range data-test="range" aria-label="r" [readonly]="ro()" />
  `,
})
class Host {
  readonly ro = signal(true);
  readonly on = signal(false);
  readonly on2 = signal(false);
  readonly options = [
    { label: 'Uno', value: 'a' },
    { label: 'Dos', value: 'b' },
  ];
  readonly sel = signal<string | null>('a');
  readonly com = signal<string | null>('a');
  readonly date = signal<string | null>('2026-11-09');
}

describe('readonly en los controles (R.12)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (t: string) => el.querySelector<HTMLElement>(`[data-test="${t}"]`)!;
    const tick = () => new Promise((r) => setTimeout(r, 30));
    return { fixture, host: fixture.componentInstance, q, tick };
  }

  it('Checkbox y Switch: el clic no cambia el valor y el rol lleva aria-readonly', async () => {
    const { fixture, host, q } = await setup();
    for (const t of ['checkbox', 'switch']) {
      const button = q(t).querySelector<HTMLButtonElement>('button')!;
      expect(button.getAttribute('aria-readonly'), t).toBe('true');
      button.click();
      await fixture.whenStable();
    }
    expect(host.on()).toBe(false);
    expect(host.on2()).toBe(false);
    host.ro.set(false);
    await fixture.whenStable();
    q('checkbox').querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(host.on()).toBe(true);
    expect(q('checkbox').querySelector('button')!.hasAttribute('aria-readonly')).toBe(false);
  });

  it('Select y Combobox: el panel no se abre, el valor se ve y no cambia', async () => {
    const { q, tick } = await setup();
    const trigger = q('select').querySelector<HTMLElement>('[role="combobox"]')!;
    expect(trigger.getAttribute('aria-readonly')).toBe('true');
    trigger.click();
    await tick();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).not.toBe('true');

    const field = q('combobox').querySelector<HTMLInputElement>('input')!;
    expect(field.readOnly).toBe(true);
    // El <input> nativo en solo lectura ya lo anuncia el navegador (no lleva aria-readonly).
    field.click();
    await tick();
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });

  it('Date Picker y Date Range: el panel no se abre', async () => {
    const { q, tick } = await setup();
    for (const t of ['date', 'range']) {
      const button = q(t).querySelector<HTMLButtonElement>('button')!;
      expect(button.getAttribute('aria-readonly'), t).toBe('true');
      button.click();
      await tick();
      // El Popover deja el panel fuera de la vista; lo que importa es que no queda «abierto».
      expect(button.getAttribute('aria-expanded'), t).not.toBe('true');
    }
  });
});
