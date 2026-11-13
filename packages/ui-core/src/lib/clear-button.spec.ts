import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * La X de limpiar de Select y Combobox (informe del usuario, 12/11/2026): solo se ve con el ratón
 * encima, el foco dentro o el panel abierto, y en pantallas sin ratón mientras haya valor; si no,
 * el chevron. Supr y Retroceso limpian con el foco en el campo. La visibilidad real (CSS) se
 * comprobó con Playwright; aquí, las clases que la dan y el teclado.
 */
@Component({
  imports: [MimiSelectImports, MimiComboboxImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select data-test="select" aria-label="Talla" [clearable]="clearable()" [(value)]="size">
      <mimi-option value="s">S</mimi-option>
      <mimi-option value="m">M</mimi-option>
    </mimi-select>
    <mimi-combobox
      data-test="combobox"
      aria-label="Ciudad"
      [clearable]="clearable()"
      [(value)]="city"
    >
      <mimi-option value="lima">Lima</mimi-option>
      <mimi-option value="quito">Quito</mimi-option>
    </mimi-combobox>
    <mimi-combobox
      data-test="multiple"
      aria-label="Ciudades"
      multiple
      [clearable]="clearable()"
      [(value)]="cities"
    >
      <mimi-option value="lima">Lima</mimi-option>
      <mimi-option value="quito">Quito</mimi-option>
    </mimi-combobox>
  `,
})
class Host {
  readonly clearable = signal(true);
  readonly size = signal<string | null>('m');
  readonly city = signal<string | string[] | null>('lima');
  readonly cities = signal<string | string[] | null>(['lima', 'quito']);
}

describe('X de limpiar de Select y Combobox', () => {
  const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

  async function setup(clearable = true) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.clearable.set(clearable);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      await fixture.whenStable();
      await tick();
      await fixture.whenStable();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const press = async (target: HTMLElement, key: string) => {
      target.focus();
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle();
    };
    return { fixture, host: fixture.componentInstance, q, press, settle };
  }

  for (const [test, group] of [
    ['select', 'select'],
    ['combobox', 'combobox'],
  ] as const) {
    it(`${test}: la X y el chevron se alternan con hover, foco, panel abierto y hover:none`, async () => {
      const { q } = await setup();
      const clear = q(`[data-test="${test}"] [data-slot="clear"]`);
      const chevron = q(`[data-test="${test}"] [data-slot="chevron"]`);
      const reveal = [
        `group-hover/${group}:inline-flex`,
        // El foco que llegó por teclado (13/11/2026; antes, `focus-within`: ver clear-visibility).
        `group-data-[focus-keyboard]/${group}:inline-flex`,
        `group-data-[state=open]/${group}:inline-flex`,
        '[@media(hover:none)]:inline-flex',
      ];
      // La X empieza oculta y aparece en los cuatro casos.
      expect(clear.getAttribute('class')!.split(' ')).toContain('hidden');
      for (const c of reveal) expect(clear.getAttribute('class')).toContain(c);
      // El chevron está, y se esconde en los mismos cuatro casos.
      for (const c of reveal)
        expect(chevron.getAttribute('class')).toContain(c.replace('inline-flex', 'hidden'));
    });

    it(`${test}: sin valor no hay X y el chevron no se esconde`, async () => {
      const { q, host, settle } = await setup();
      if (test === 'select') host.size.set(null);
      else host.city.set(null);
      await settle();
      expect(document.querySelector(`[data-test="${test}"] [data-slot="clear"]`)).toBeNull();
      expect(q(`[data-test="${test}"] [data-slot="chevron"]`).getAttribute('class')).not.toContain(
        'hidden',
      );
    });
  }

  it('select: Supr y Retroceso en el disparador limpian', async () => {
    const { q, host, press, settle } = await setup();
    const trigger = q('[data-test="select"] [role="combobox"]');
    await press(trigger, 'Delete');
    expect(host.size()).toBeNull();
    host.size.set('s');
    await settle();
    await press(trigger, 'Backspace');
    expect(host.size()).toBeNull();
  });

  it('combobox: Supr y Retroceso limpian el valor elegido (no lo que se escribe)', async () => {
    const { q, host, press, settle } = await setup();
    const input = q<HTMLInputElement>('[data-test="combobox"] input');
    await press(input, 'Backspace');
    expect(host.city()).toBeNull();
    expect(input.value).toBe('');
    host.city.set('quito');
    await settle();
    expect(input.value).toBe('Quito');
    await press(input, 'Delete');
    expect(host.city()).toBeNull();
    // Escribiendo, Retroceso borra letras: el valor no se toca.
    host.city.set('lima');
    await settle();
    input.focus();
    input.value = 'Lim';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }),
    );
    await settle();
    await press(input, 'Backspace');
    expect(host.city()).toBe('lima');
  });

  it('combobox múltiple: Supr con el campo vacío quita todos; Retroceso, el último', async () => {
    const { q, host, press } = await setup();
    const input = q<HTMLInputElement>('[data-test="multiple"] input');
    await press(input, 'Backspace');
    expect(host.cities()).toEqual(['lima']);
    await press(input, 'Delete');
    expect(host.cities()).toEqual([]);
  });

  it('sin clearable, Supr y Retroceso no quitan el valor', async () => {
    const { q, host, press } = await setup(false);
    await press(q('[data-test="select"] [role="combobox"]'), 'Delete');
    await press(q<HTMLInputElement>('[data-test="combobox"] input'), 'Delete');
    expect(host.size()).toBe('m');
    expect(host.city()).toBe('lima');
  });
});
