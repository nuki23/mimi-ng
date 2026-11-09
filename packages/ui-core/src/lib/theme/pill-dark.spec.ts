/**
 * R.10: el indicador de Tabs (píldora) y el de Toggle Group, en oscuro.
 *
 * Diagnóstico (Chrome sin ventana, 09/11/2026): con `card` como fondo (más oscuro que `muted`) y
 * `shadow-neutral` (una sombra de 4px de desplazamiento y 10px de desenfoque), la píldora se veía
 * hundida y su sombra salía por el borde del contenedor, que solo deja 3 a 4px de margen.
 *
 * Las pruebas corren en Node: se lee el CSS con fs (ver imports.spec.ts).
 */
const pillNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const pillFs = pillNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const PILL_CSS = pillFs.readFileSync(
  `${pillNode.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
  'utf8',
);
const PILL_TABS = pillFs.readFileSync(
  `${pillNode.cwd()}/packages/ui-core/src/lib/components/tabs/tabs.ts`,
  'utf8',
);

/** El cuerpo del bloque `.dark { … }` de nivel superior. */
function pillDarkBlock(): string {
  const start = PILL_CSS.indexOf('\n.dark {');
  return PILL_CSS.slice(start, PILL_CSS.indexOf('\n}', start + 1));
}

describe('indicador de píldora en oscuro (R.10)', () => {
  it('el fondo se mezcla con foreground sobre muted: más claro que el contenedor', () => {
    const block = pillDarkBlock();
    expect(block).toMatch(
      /--mimi-tabs-pill-active:\s*color-mix\(in oklab, var\(--mimi-foreground\) \d+%, var\(--mimi-muted\)\)/,
    );
    expect(block).toMatch(/--mimi-toggle-group-indicator:\s*var\(--mimi-tabs-pill-active\)/);
  });

  it('la sombra no sale del margen del contenedor (desplazamiento + desenfoque ≤ 3px)', () => {
    const block = pillDarkBlock();
    const shadow = /--mimi-tabs-pill-shadow:\s*([^;]+);/.exec(block)![1];
    for (const layer of shadow.split(/,(?![^(]*\))/)) {
      if (layer.trim().startsWith('inset')) continue;
      const m = /^\s*-?\d+(?:px)?\s+(-?\d+)px\s+(-?\d+)px/.exec(layer)!;
      expect(Math.abs(Number(m[1])) + Number(m[2])).toBeLessThanOrEqual(3);
    }
    expect(block).toMatch(/--mimi-toggle-group-indicator-shadow:\s*var\(--mimi-tabs-pill-shadow\)/);
  });

  it('Tabs usa el token de la sombra de la píldora, con el de neutral como respaldo', () => {
    expect(PILL_TABS).toContain(
      'shadow-[shadow:var(--mimi-tabs-pill-shadow,var(--mimi-shadow-neutral))]',
    );
  });
});
