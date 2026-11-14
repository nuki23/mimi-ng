import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiBadge } from '@/components/ui/badge';
import { MimiTabs } from '@/components/ui/tabs';
import { MimiToggleGroup } from '@/components/ui/toggle-group';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiColorPicker } from '@/components/ui/color-picker';
import { MimiCombobox } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiInputMask } from '@/components/ui/input-mask';
import { MimiNumberInput } from '@/components/ui/number-input';
import { MimiPassword } from '@/components/ui/password';
import { MimiSelect } from '@/components/ui/select';
import { MimiTagsInput } from '@/components/ui/tags-input';
import { MimiTextarea } from '@/components/ui/textarea';
import { MimiSizeScope, type MimiSizeInput } from './size';

/**
 * R.2: todos los controles de formulario aceptan `size` (sm | md | lg), ponen `data-size` (que
 * activa la escala del tema) y heredan el de un contenedor `mimiSize`. Su alto sale de la escala.
 */
@Component({
  imports: [
    MimiSizeScope,
    MimiSelect,
    MimiCombobox,
    MimiNumberInput,
    MimiPassword,
    MimiInputMask,
    MimiTagsInput,
    MimiDatePicker,
    MimiDateRangePicker,
    MimiColorPicker,
    MimiTextarea,
    MimiSwitch,
    MimiCheckbox,
    MimiTabs,
    MimiToggleGroup,
    MimiBadge,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [mimiSize]="scope()">
      <mimi-select data-test="select" aria-label="a" />
      <mimi-combobox data-test="combobox" aria-label="b" />
      <mimi-number-input data-test="number" aria-label="c" />
      <mimi-password data-test="password" aria-label="d" />
      <mimi-input-mask data-test="mask" mask="00" aria-label="e" />
      <mimi-tags-input data-test="tags" aria-label="f" />
      <mimi-date-picker data-test="date" aria-label="g" />
      <mimi-date-range data-test="range" aria-label="h" />
      <mimi-color-picker data-test="color" aria-label="i" />
      <textarea mimiTextarea data-test="textarea" aria-label="j"></textarea>
      <mimi-switch data-test="switch">Modo avión</mimi-switch>
      <mimi-checkbox data-test="checkbox">Recordarme</mimi-checkbox>
      <mimi-tabs data-test="tabs" aria-label="t" />
      <mimi-toggle-group data-test="toggle" aria-label="g" />
      <span mimiBadge data-test="badge">Nuevo</span>
      <mimi-select data-test="own" size="lg" aria-label="k" />
    </section>
    <mimi-select data-test="outside" aria-label="l" />
    <mimi-select data-test="explicit" size="sm" aria-label="m" />
  `,
})
class Host {
  readonly scope = signal<MimiSizeInput>('sm');
}

const CONTROLS = [
  'select',
  'combobox',
  'number',
  'password',
  'mask',
  'tags',
  'date',
  'range',
  'color',
  'textarea',
  'switch',
  'checkbox',
  'tabs',
  'toggle',
  'badge',
];

describe('tamaños en los controles de formulario (R.2)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const q = (t: string) =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`[data-test="${t}"]`)!;
    return { fixture, host: fixture.componentInstance, q };
  }

  it('sin size propio heredan el del contenedor; el propio gana; sin nada, md', async () => {
    const { q, host, fixture } = await setup();
    // Sin `size` propio no escriben data-size: lo hereda del contenedor por la cascada de CSS.
    const near = (e: HTMLElement) => e.closest('[data-size]')?.getAttribute('data-size') ?? null;
    for (const t of CONTROLS) {
      expect(q(t).hasAttribute('data-size'), t).toBe(false);
      expect(near(q(t)), t).toBe('sm');
    }
    expect(q('own').dataset['size']).toBe('lg');
    expect(q('explicit').dataset['size']).toBe('sm');
    expect(q('outside').hasAttribute('data-size')).toBe(false);
    expect(near(q('outside'))).toBeNull();
    host.scope.set('lg');
    await fixture.whenStable();
    for (const t of CONTROLS) expect(near(q(t)), t).toBe('lg');
  });
});
