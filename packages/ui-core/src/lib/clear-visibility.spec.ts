import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * La X de limpiar de Select y Combobox (13/11/2026): se ve con el ratón encima, con el foco que
 * llegó por teclado (FocusMonitor: `data-focus-keyboard` en la caja) o con el panel abierto; en
 * pantallas táctiles, mientras haya valor. Después de elegir con el ratón, el foco sigue en el
 * campo pero la X no se queda: no basta con `focus-within`.
 */
@Component({
  imports: [MimiSelectImports, MimiComboboxImports],
  template: `
    <mimi-select aria-label="Talla" value="m" clearable>
      <mimi-option value="m">M</mimi-option>
      <mimi-option value="l">L</mimi-option>
    </mimi-select>
    <mimi-combobox aria-label="Ciudad" value="lima" clearable>
      <mimi-option value="lima">Lima</mimi-option>
    </mimi-combobox>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ClearHost {}

const settle = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

async function setup() {
  const fixture = TestBed.createComponent(ClearHost);
  document.body.appendChild(fixture.nativeElement);
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el };
}

function press(target: EventTarget, type: 'mouse' | 'keyboard'): void {
  if (type === 'keyboard') {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
  } else {
    // `detail: 1` como un clic de verdad: con 0, el CDK lo toma por un lector de pantalla.
    target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, buttons: 1, detail: 1 }));
  }
}

for (const [name, boxSel, focusSel, group] of [
  ['Select', 'mimi-select > div', 'button[role="combobox"]', 'select'],
  ['Combobox', 'mimi-combobox [data-slot="box"]', 'input', 'combobox'],
] as const) {
  describe(`${name}: la X de limpiar`, () => {
    it('no depende de focus-within: la muestra el foco de teclado', async () => {
      const { el } = await setup();
      const clear = el.querySelector<HTMLElement>(`${boxSel} [data-slot="clear"]`)!;
      expect(clear, 'la X está').not.toBeNull();
      expect(clear.className).not.toContain(`group-focus-within/${group}:inline-flex`);
      expect(clear.className).toContain(`group-data-[focus-keyboard]/${group}:inline-flex`);
      expect(clear.className).toContain(`group-hover/${group}:inline-flex`);
      expect(clear.className).toContain(`group-data-[state=open]/${group}:inline-flex`);
      expect(clear.className).toContain('[@media(hover:none)]:inline-flex');
    });

    it('foco con el teclado: data-focus-keyboard; con el ratón, no', async () => {
      const { fixture, el } = await setup();
      const box = el.querySelector<HTMLElement>(boxSel)!;
      const field = el.querySelector<HTMLElement>(`${boxSel} ${focusSel}`)!;
      press(document, 'keyboard');
      field.focus();
      await settle(fixture);
      expect(box.hasAttribute('data-focus-keyboard')).toBe(true);
      field.blur();
      await settle(fixture);
      expect(box.hasAttribute('data-focus-keyboard')).toBe(false);
      press(field, 'mouse');
      field.focus();
      await settle(fixture);
      expect(box.hasAttribute('data-focus-keyboard')).toBe(false);
      // El foco que vuelve desde el código después de usar el ratón (al elegir) tampoco.
      field.blur();
      press(document.body, 'mouse');
      field.focus();
      await settle(fixture);
      expect(box.hasAttribute('data-focus-keyboard')).toBe(false);
      fixture.destroy();
    });
  });
}
