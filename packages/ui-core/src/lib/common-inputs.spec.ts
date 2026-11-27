import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiCombobox } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiFileUpload } from '@/components/ui/file-upload';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInputMask } from '@/components/ui/input-mask';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { MimiNumberInput } from '@/components/ui/number-input';
import { MimiSelect } from '@/components/ui/select';
import { MimiSlider } from '@/components/ui/slider';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTagsInput } from '@/components/ui/tags-input';
import { MimiToggleGroup, MimiToggleGroupItem } from '@/components/ui/toggle-group';
import { MimiTree } from '@/components/ui/tree';

/**
 * M.16 (y M.21, Switch): las entradas comunes de los controles de formulario. Cada control acepta
 * `aria-describedby`: los ids del usuario van en el elemento que se enfoca (el que tiene el rol),
 * **se suman** a los propios del control y a los de `mimi-form-field` (no los reemplazan), y el
 * anfitrión no se queda con el atributo (sería un segundo elemento descrito). La tabla de qué
 * control acepta `readonly`, `aria-labelledby` y `aria-describedby` está en la spec 8.
 */
const CONTROLS: { tag: string; focus: string }[] = [
  { tag: 'mimi-checkbox', focus: '[role="checkbox"]' },
  { tag: 'mimi-switch', focus: '[role="switch"]' },
  { tag: 'mimi-select', focus: '[aria-haspopup]' },
  { tag: 'mimi-combobox', focus: 'input' },
  { tag: 'mimi-date-picker', focus: 'button[aria-haspopup]' },
  { tag: 'mimi-date-range-picker', focus: 'button[aria-haspopup]' },
  { tag: 'mimi-color-input', focus: 'button[aria-haspopup]' },
  { tag: 'mimi-file-upload', focus: 'button' },
  { tag: 'mimi-input-mask', focus: 'input' },
  { tag: 'mimi-input-otp', focus: 'input' },
  { tag: 'mimi-number-input', focus: 'input' },
  { tag: 'mimi-slider', focus: '[role="slider"]' },
  { tag: 'mimi-tags-input', focus: 'input' },
  { tag: 'mimi-toggle-group', focus: ':scope' },
  { tag: 'mimi-tree', focus: '[role="tree"]' },
];

@Component({
  imports: [
    MimiCheckbox,
    MimiColorInput,
    MimiCombobox,
    MimiDatePicker,
    MimiDateRangePicker,
    MimiFileUpload,
    MimiFormField,
    MimiInputMask,
    MimiInputOtp,
    MimiNumberInput,
    MimiSelect,
    MimiSlider,
    MimiSwitch,
    MimiTagsInput,
    MimiToggleGroup,
    MimiToggleGroupItem,
    MimiTree,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p id="ayuda">Ayuda del usuario</p>
    <div data-test="solo">
      <mimi-checkbox aria-label="c" aria-describedby="ayuda" />
      <mimi-switch aria-label="s" aria-describedby="ayuda" />
      <mimi-select aria-label="s" aria-describedby="ayuda" [options]="options" />
      <mimi-combobox aria-label="c" aria-describedby="ayuda" [options]="options" />
      <mimi-date-picker aria-label="d" aria-describedby="ayuda" />
      <mimi-date-range-picker aria-label="r" aria-describedby="ayuda" />
      <mimi-color-input aria-label="k" aria-describedby="ayuda" />
      <mimi-file-upload aria-label="f" aria-describedby="ayuda" />
      <mimi-input-mask aria-label="m" aria-describedby="ayuda" mask="999" />
      <mimi-input-otp aria-label="o" aria-describedby="ayuda" />
      <mimi-number-input aria-label="n" aria-describedby="ayuda" />
      <mimi-slider aria-label="l" aria-describedby="ayuda" />
      <mimi-tags-input aria-label="t" aria-describedby="ayuda" />
      <mimi-toggle-group aria-label="g" aria-describedby="ayuda">
        <button mimiToggleGroupItem="a">A</button>
      </mimi-toggle-group>
      <mimi-tree aria-label="a" aria-describedby="ayuda" [nodes]="nodes" />
    </div>
    <div data-test="field">
      <mimi-form-field label="Casilla" hint="Pista">
        <mimi-checkbox aria-describedby="ayuda" />
      </mimi-form-field>
      <mimi-form-field label="Interruptor" hint="Pista">
        <mimi-switch aria-describedby="ayuda" />
      </mimi-form-field>
      <mimi-form-field label="Fecha" hint="Pista">
        <mimi-date-picker aria-describedby="ayuda" />
      </mimi-form-field>
      <mimi-form-field label="Número" hint="Pista">
        <mimi-number-input aria-describedby="ayuda" />
      </mimi-form-field>
    </div>
  `,
})
class Host {
  readonly options = [{ label: 'Uno', value: 'a' }];
  readonly nodes = [{ id: 'n', label: 'Nodo' }];
}

describe('entradas comunes de los controles (M.16, M.21)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    for (let i = 0; i < 3; i++) {
      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));
    }
    return fixture.nativeElement as HTMLElement;
  }
  const ids = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(/\s+/);

  it('aria-describedby va en el elemento enfocable, sumado a lo propio, y no en el anfitrión', async () => {
    const el = await setup();
    const problems: string[] = [];
    for (const { tag, focus } of CONTROLS) {
      const host = el.querySelector(`[data-test="solo"] ${tag}`)!;
      const target = focus === ':scope' ? host : host.querySelector(focus);
      if (!target) {
        problems.push(`${tag}: no se encontró ${focus}`);
        continue;
      }
      if (!ids(target).includes('ayuda')) problems.push(`${tag}: falta «ayuda» en ${focus}`);
      if (target !== host && host.hasAttribute('aria-describedby')) {
        problems.push(`${tag}: el anfitrión también lleva aria-describedby`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('con mimi-form-field: los ids del usuario, la pista y lo propio, sin repetir', async () => {
    const el = await setup();
    const fields = [...el.querySelectorAll('[data-test="field"] mimi-form-field')];
    expect(fields.length).toBe(4);
    for (const field of fields) {
      const target = field.querySelector(
        '[role="checkbox"], [role="switch"], button[aria-haspopup], input',
      )!;
      const list = ids(target);
      const hint = field.querySelector('[data-slot="hint"]')!.id;
      expect(list, field.textContent!).toContain('ayuda');
      expect(list, field.textContent!).toContain(hint);
      expect(new Set(list).size, field.textContent!).toBe(list.length);
    }
  });
});
