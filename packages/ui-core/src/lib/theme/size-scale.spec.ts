/**
 * La escala de tamaños vive UNA vez en el tema (R.1, R.8): variables por `[data-size]`.
 * Las pruebas corren en Node: se lee el CSS con fs (ver imports.spec.ts).
 */
const scaleNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const scaleFs = scaleNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const SCALE_CSS = scaleFs.readFileSync(
  `${scaleNode.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
  'utf8',
);

/** El cuerpo de un bloque de la escala (`:root, [data-size='md']`, `[data-size='sm']`…). */
function scaleBlock(selector: string): string {
  const start = SCALE_CSS.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return SCALE_CSS.slice(start, SCALE_CSS.indexOf('\n}', start));
}
const scaleVar = (block: string, name: string) =>
  new RegExp(`--mimi-${name}:\\s*([^;]+);`).exec(block)?.[1].trim();

describe('escala de tamaños en el tema ([data-size])', () => {
  const sm = scaleBlock("[data-size='sm']");
  const md = scaleBlock(":root,\n[data-size='md']");
  const lg = scaleBlock("[data-size='lg']");

  it('cada tamaño define alto, relleno, texto, ícono y hueco; md es el de :root', () => {
    for (const block of [sm, md, lg]) {
      for (const name of ['size-height', 'size-px', 'size-text', 'size-icon', 'size-gap']) {
        expect(scaleVar(block, name), name).toBeTruthy();
      }
    }
    expect(scaleVar(sm, 'size-height')).toContain('--mimi-control-height-sm');
    expect(scaleVar(md, 'size-height')).toContain('--mimi-control-height');
    expect(scaleVar(lg, 'size-height')).toContain('--mimi-control-height-lg');
    expect([sm, md, lg].map((b) => scaleVar(b, 'size-text'))).toEqual(['13px', '0.875rem', '15px']);
    expect([sm, md, lg].map((b) => scaleVar(b, 'size-px'))).toEqual(['0.75rem', '1rem', '1.5rem']);
  });

  it('Switch y Checkbox: pista 32×18 / 36×20 / 44×24 y casilla 14 / 16 / 20 px', () => {
    expect([sm, md, lg].map((b) => scaleVar(b, 'switch-w'))).toEqual([
      '2rem',
      'var(--mimi-switch-width, 2.25rem)',
      '2.75rem',
    ]);
    expect([sm, md, lg].map((b) => scaleVar(b, 'switch-h'))).toEqual([
      '1.125rem',
      'var(--mimi-switch-height, 1.25rem)',
      '1.5rem',
    ]);
    expect([sm, md, lg].map((b) => scaleVar(b, 'checkbox-s'))).toEqual([
      '0.875rem',
      'var(--mimi-checkbox-size, 1rem)',
      '1.25rem',
    ]);
  });

  it('Toast: alto mínimo, relleno, texto, ícono y ancho por tamaño; md es el de siempre', () => {
    const at = (name: string) => [sm, md, lg].map((b) => scaleVar(b, name));
    expect(at('toast-min-h')).toEqual(['48px', '68px', '84px']);
    expect(at('toast-py')).toEqual(['0.5rem', '0.75rem', '1rem']);
    expect(at('toast-pl')).toEqual(['0.75rem', '0.875rem', '1.125rem']);
    expect(at('toast-title')).toEqual(['13px', '0.875rem', '15px']);
    expect(at('toast-desc')).toEqual(['12px', '12.5px', '14px']);
    expect(at('toast-icon')).toEqual(['16px', '18px', '20px']);
    expect(at('toast-circle')).toEqual(['28px', '34px', '40px']);
    expect(at('toast-w')).toEqual(['288px', 'var(--mimi-toast-width, 340px)', '400px']);
  });

  it('Tabs, Toggle Group y Badge: alto, relleno y texto por tamaño; md es el de siempre', () => {
    const at = (name: string) => [sm, md, lg].map((b) => scaleVar(b, name));
    expect(at('tabs-h-u')).toEqual(['36px', 'var(--mimi-tabs-height, 44px)', '52px']);
    expect(at('tabs-h-p')).toEqual(['30px', '34px', '40px']);
    expect(at('tabs-text-p')).toEqual(['12.5px', '13.5px', '15px']);
    expect(at('toggle-h')).toEqual(['28px', 'var(--mimi-toggle-group-item-height, 32px)', '40px']);
    expect(at('toggle-px')).toEqual(['10px', 'var(--mimi-toggle-group-item-px, 12px)', '16px']);
    expect(at('badge-h')).toEqual(['18px', 'var(--mimi-badge-height, 22px)', '26px']);
    expect(at('badge-px-s')).toEqual(['0.5rem', 'var(--mimi-badge-px, 0.625rem)', '0.75rem']);
  });

  it('los tokens por tamaño de siempre (btn, input y avatar) se resuelven en su bloque, sin filtrarse', () => {
    expect(scaleVar(sm, 'btn-h')).toBe('var(--mimi-btn-height-sm, var(--mimi-size-height))');
    expect(scaleVar(md, 'btn-h')).toBe('var(--mimi-btn-height, var(--mimi-size-height))');
    expect(scaleVar(lg, 'btn-h')).toBe('var(--mimi-btn-height-lg, var(--mimi-size-height))');
    expect(scaleVar(sm, 'input-h')).toContain('--mimi-input-height-sm');
    expect(scaleVar(lg, 'avatar-s')).toContain('--mimi-avatar-size-lg');
    // Un md dentro de un sm no hereda el alto del sm: md vuelve a declarar cada variable.
    for (const name of ['btn-h', 'input-h', 'avatar-s', 'size-height']) {
      expect(scaleVar(md, name), name).toBeTruthy();
    }
  });
});
