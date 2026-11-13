import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiInputMask } from '@/components/ui/input-mask';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { MimiSelectImports } from '@/components/ui/select';
import { MimiTagsInput } from '@/components/ui/tags-input';

/**
 * Un solo juego de estados para los campos (utils/field-styles.ts, Parte 2 de la unificación,
 * 12/11/2026): cada control del inventario (docs/plan/controles/inventario.md) usa sus piezas, no
 * clases propias; ninguno deja la opacidad de deshabilitado fija; la solo lectura se marca en la
 * caja para que se vea. Lee los archivos con fs, como imports.spec.ts.
 */
const statesNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const statesFs = statesNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
  readdirSync(path: string): string[];
};
const STATES_LIB = `${statesNode.cwd()}/packages/ui-core/src/lib`;
const statesSource = (file: string) => statesFs.readFileSync(`${STATES_LIB}/${file}`, 'utf8');

/** Control → archivo y la pieza común (o la marca) que tiene que llevar. */
const STATES_CONTROLS: Record<string, [file: string, marks: string[]]> = {
  Input: ['components/input/input.variants.ts', ['fieldNativeStyles']],
  Textarea: ['components/textarea/textarea.variants.ts', ['fieldNativeStyles']],
  Select: ['components/select/select.ts', ['fieldTriggerBoxStyles', 'data-readonly]']],
  Combobox: ['components/combobox/combobox.ts', ['fieldBoxStyles', 'data-readonly]']],
  'Tags Input': ['components/tags-input/tags-input.ts', ['fieldBoxStyles', 'data-readonly]']],
  'Number Input': ['components/number-input/number-input.ts', ['fieldBoxStyles']],
  Password: ['components/password/password.ts', ['fieldBoxStyles', 'nativeReadonly']],
  'Input Mask': ['components/input-mask/input-mask.ts', ['fieldBoxStyles', 'data-readonly]']],
  'Input OTP': ['components/input-otp/input-otp.ts', ['var(--mimi-input-readonly)', 'errorActive']],
  'Date Picker': ['components/date-picker/date-picker.ts', ['fieldTriggerStyles']],
  'Date Range': ['components/date-range/date-range.ts', ['MIMI_DATE_TRIGGER_CLASSES']],
  'Color Picker': ['components/color-picker/color-picker.ts', ['fieldTriggerStyles']],
  'File Upload': [
    'components/file-upload/file-upload.ts',
    ['var(--mimi-input-readonly)', 'readonlyTitle', 'var(--mimi-input-error'],
  ],
  Slider: ['components/slider/slider.ts', ['not-aria-readonly:hover', 'not-aria-readonly:active']],
  Checkbox: ['components/checkbox/checkbox.ts', ['choicePressStyles', 'aria-invalid:border']],
  Switch: ['components/switch/switch.ts', ['choicePressStyles', 'aria-invalid:ring-1']],
  'Toggle Group': [
    'components/toggle-group/toggle-group.ts',
    [
      'in-data-readonly:cursor-default',
      'active:ring-3',
      'opacity-[var(--mimi-disabled-opacity,0.5)]',
    ],
  ],
  Button: ['components/button/button.variants.ts', ['controlDisabledStyles']],
};

@Component({
  imports: [MimiSelectImports, MimiComboboxImports, MimiTagsInput, MimiInputMask, MimiInputOtp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select data-test="select" aria-label="a" readonly>
      <mimi-option value="a">A</mimi-option>
    </mimi-select>
    <mimi-combobox data-test="combobox" aria-label="b" readonly />
    <mimi-tags-input data-test="tags" aria-label="c" readonly />
    <mimi-input-mask data-test="mask" aria-label="d" mask="000" readonly />
    <mimi-input-otp data-test="otp" aria-label="e" readonly />
  `,
})
class ReadonlyHost {}

describe('Estados de los campos: un solo juego (field-styles)', () => {
  it('los 18 controles del inventario usan las piezas comunes', () => {
    expect(Object.keys(STATES_CONTROLS).length).toBe(18);
    for (const [name, [file, marks]] of Object.entries(STATES_CONTROLS)) {
      const code = statesSource(file);
      for (const mark of marks) expect(code, `${name}: ${mark}`).toContain(mark);
    }
  });

  it('ningún componente deja la opacidad de deshabilitado fija (el token --mimi-disabled-opacity)', () => {
    const wrong: string[] = [];
    const walk = (dir: string) => {
      for (const entry of statesFs.readdirSync(`${STATES_LIB}/${dir}`)) {
        const path = `${dir}/${entry}`;
        if (!entry.includes('.')) walk(path);
        else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
          if (/opacity-50\b/.test(statesSource(path))) wrong.push(path);
        }
      }
    };
    walk('components');
    walk('utils');
    expect(wrong).toEqual([]);
  });

  it('la solo lectura queda marcada en la caja que se ve', async () => {
    const fixture = TestBed.createComponent(ReadonlyHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (s: string) => el.querySelector<HTMLElement>(s)!;
    expect(q('[data-test="select"] > div').hasAttribute('data-readonly')).toBe(true);
    expect(q('[data-test="combobox"] [data-slot="box"]').hasAttribute('data-readonly')).toBe(true);
    expect(q('[data-test="tags"] [data-slot="box"]').hasAttribute('data-readonly')).toBe(true);
    expect(q('[data-test="mask"]').hasAttribute('data-readonly')).toBe(true);
    expect(q('[data-test="otp"]').hasAttribute('data-readonly')).toBe(true);
    // Las casillas de OTP, con el fondo de solo lectura (desde la fila).
    expect(q('[data-test="otp"] [data-slot="box"]').className).toContain(
      'group-data-[readonly]/otp:bg-[color:var(--mimi-input-readonly)]',
    );
  });
});
