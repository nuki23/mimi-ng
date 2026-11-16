import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiFileUpload } from '@/components/ui/file-upload';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { MimiSizeScope } from './size';

const m27Node = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const m27Fs = m27Node.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const CSS = m27Fs.readFileSync(
  `${m27Node.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
  'utf8',
);

function block(selector: string): string {
  const start = CSS.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return CSS.slice(start, CSS.indexOf('\n}', start));
}
const at = (name: string) =>
  ["[data-size='sm']", ":root,\n[data-size='md']", "[data-size='lg']"].map((selector) =>
    new RegExp(`--mimi-${name}:\\s*([^;]+);`).exec(block(selector))?.[1].trim(),
  );

describe('M.27: Input OTP y File Upload en la escala del tema', () => {
  it('Input OTP: casilla 40×46 / 46×54 / 52×62, texto 18 / 22 / 26 y hueco 6 / 8 / 10; md con sus tokens', () => {
    expect(at('otp-w')).toEqual(['40px', 'var(--mimi-otp-width, 46px)', '52px']);
    expect(at('otp-h')).toEqual(['46px', 'var(--mimi-otp-height, 54px)', '62px']);
    expect(at('otp-text')).toEqual(['18px', 'var(--mimi-otp-font-size, 22px)', '26px']);
    expect(at('otp-gap-s')).toEqual(['6px', 'var(--mimi-otp-gap, 8px)', '10px']);
  });

  it('File Upload: alto mínimo, relleno, ícono y textos por tamaño; md con sus tokens', () => {
    expect(at('upload-min-h')).toEqual(['136px', 'var(--mimi-upload-height, 176px)', '216px']);
    expect(at('upload-p')).toEqual(['0.75rem', '1rem', '1.5rem']);
    expect(at('upload-icon-s')).toEqual(['36px', 'var(--mimi-upload-icon-size, 44px)', '52px']);
    expect(at('upload-svg')).toEqual(['18px', '22px', '26px']);
    expect(at('upload-title')).toEqual(['13px', '0.875rem', '15px']);
    expect(at('upload-hint')).toEqual(['12px', '12.5px', '13.5px']);
  });
});

@Component({
  imports: [MimiInputOtp, MimiFileUpload, MimiColorInput, MimiSizeScope],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-input-otp data-test="otp" aria-label="Código" size="lg" />
    <mimi-file-upload data-test="upload" size="sm" />
    <mimi-color-input data-test="color" aria-label="Color" size="lg" />
    <div mimiSize="sm">
      <mimi-input-otp data-test="otp-in" aria-label="Código" />
      <mimi-color-input data-test="color-in" aria-label="Color" />
    </div>
    <mimi-input-otp data-test="otp-plain" aria-label="Código" />
  `,
})
class Host {}

describe('M.27: size en Input OTP, File Upload y mimi-color-input', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el: (id: string) => root.querySelector<HTMLElement>(`[data-test="${id}"]`)!,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('el size propio pone data-size; sin él, no (hereda por la cascada)', async () => {
    const { el } = await setup();
    expect(el('otp').dataset['size']).toBe('lg');
    expect(el('upload').dataset['size']).toBe('sm');
    expect(el('color').dataset['size']).toBe('lg');
    expect(el('otp-plain').hasAttribute('data-size')).toBe(false);
    expect(el('otp-in').hasAttribute('data-size')).toBe(false);
  });

  it('las piezas leen la escala con respaldo al token de siempre', async () => {
    const { el } = await setup();
    const box = el('otp').querySelector<HTMLElement>('[data-slot="box"]')!;
    for (const cls of [
      'w-[var(--mimi-otp-w,var(--mimi-otp-width,46px))]',
      'h-[var(--mimi-otp-h,var(--mimi-otp-height,54px))]',
      'text-[length:var(--mimi-otp-text,var(--mimi-otp-font-size,22px))]',
    ]) {
      expect(box.classList).toContain(cls);
    }
    expect(el('otp').classList).toContain('gap-[var(--mimi-otp-gap-s,var(--mimi-otp-gap,8px))]');
    const zone = el('upload').querySelector<HTMLElement>('button')!;
    for (const cls of [
      'min-h-[var(--mimi-upload-min-h,var(--mimi-upload-height,176px))]',
      'p-[var(--mimi-upload-p,1rem)]',
    ]) {
      expect(zone.classList).toContain(cls);
    }
    expect(el('upload').querySelector('[data-slot="title"]')!.classList).toContain(
      'text-[length:var(--mimi-upload-title,0.875rem)]',
    );
  });

  it('mimi-color-input pasa su tamaño al selector del panel (overlay), también el heredado', async () => {
    const { fixture, el } = await setup();
    for (const [id, size] of [
      ['color', 'lg'],
      ['color-in', 'sm'],
    ] as const) {
      el(id).querySelector<HTMLButtonElement>('button')!.click();
      await fixture.whenStable();
      const picker = document.querySelector<HTMLElement>(
        '[data-mimi-overlay-panel] mimi-color-picker',
      );
      expect(picker?.dataset['size'], id).toBe(size);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.replaceChildren());
      await fixture.whenStable();
    }
  });
});
