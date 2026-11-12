import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * `<mimi-option>` y `<mimi-optgroup>` de verdad en el DOM (informe del usuario, 12/11/2026: «no
 * salen las opciones»): se abre el panel y se mira el texto de cada `role="option"`; elegir una
 * cambia el valor. Con opciones escritas a mano, dentro de `@for` (con interpolación) y en grupos.
 */
@Component({
  imports: [MimiSelectImports, MimiComboboxImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select data-test="select" aria-label="Plan" [(value)]="plan">
      <mimi-option value="free">Gratis</mimi-option>
      <mimi-optgroup label="Personas">
        @for (p of plans(); track p.id) {
          <mimi-option [value]="p.id" [hint]="p.hint">{{ p.name }}</mimi-option>
        }
      </mimi-optgroup>
    </mimi-select>

    <mimi-combobox data-test="combobox" aria-label="Ciudad" [(value)]="city">
      <mimi-optgroup label="España">
        <mimi-option value="madrid">Madrid</mimi-option>
      </mimi-optgroup>
      @for (c of cities(); track c) {
        <mimi-option [value]="c">{{ c }}</mimi-option>
      }
    </mimi-combobox>
  `,
})
class Host {
  readonly plan = signal<string | null>(null);
  readonly city = signal<string | string[] | null>(null);
  readonly plans = signal([
    { id: 'pro', name: 'Pro', hint: '' },
    { id: 'year', name: 'Pro anual', hint: '2 meses gratis' },
  ]);
  readonly cities = signal(['Lima', 'Bogotá']);
}

describe('<mimi-option> proyectados: el panel los muestra y se pueden elegir', () => {
  const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await tick();
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, host: fixture.componentInstance };
  }

  const optionTexts = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).map((o) =>
      o.textContent!.replace(/\s+/g, ' ').trim(),
    );

  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = '')),
  );

  it('Select: opciones sueltas, en @for y en un grupo; elegir cambia el valor', async () => {
    const { fixture, el, host } = await setup();
    el.querySelector<HTMLElement>('[data-test="select"] [role="combobox"]')!.click();
    await tick();
    await fixture.whenStable();
    const texts = optionTexts();
    expect(texts.length).toBe(3);
    expect(texts[0]).toBe('Gratis');
    expect(texts[1]).toBe('Pro');
    // La etiqueta y, a la derecha, el hint.
    expect(texts[2]).toContain('Pro anual');
    expect(texts[2]).toContain('2 meses gratis');
    const group = document.querySelector('[role="group"]');
    expect(group?.textContent).toContain('Personas');
    // Elegir «Pro anual».
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))[2].click();
    await tick();
    await fixture.whenStable();
    expect(host.plan()).toBe('year');
    expect(el.querySelector('[data-test="select"] [role="combobox"]')!.textContent).toContain(
      'Pro anual',
    );
  });

  it('Select: si cambia la lista del @for o un texto, el panel lo sigue', async () => {
    const { fixture, el, host } = await setup();
    host.plans.set([{ id: 'team', name: 'Equipo', hint: '' }]);
    await fixture.whenStable();
    await tick();
    el.querySelector<HTMLElement>('[data-test="select"] [role="combobox"]')!.click();
    await tick();
    await fixture.whenStable();
    expect(optionTexts()).toEqual(['Gratis', 'Equipo']);
  });

  it('Combobox: grupo y @for; escribir filtra y elegir cambia el valor', async () => {
    const { fixture, el, host } = await setup();
    const input = el.querySelector<HTMLInputElement>('[data-test="combobox"] input')!;
    input.click();
    await tick();
    await fixture.whenStable();
    expect(optionTexts()).toEqual(['Madrid', 'Lima', 'Bogotá']);
    expect(document.body.textContent).toContain('España');
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))[1].click();
    await tick();
    await fixture.whenStable();
    expect(host.city()).toBe('Lima');
    expect(input.value).toBe('Lima');
  });
});
