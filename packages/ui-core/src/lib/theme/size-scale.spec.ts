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
