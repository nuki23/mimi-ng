/**
 * `.cdk-visually-hidden` en theme-base.css (06/11/2026). El LiveAnnouncer del CDK (Pagination,
 * Toast, Password, File Upload y el ítem `chip`) crea al final del body un elemento con esa clase,
 * pero no carga su CSS: el CDK solo lo inyecta con Dialog y las trampas de foco. Sin la regla,
 * el anuncio («Página 2 de 12») queda visible al final de la página. jsdom no aplica el CSS real
 * (eso se comprobó en Chrome); aquí se vigila el texto:
 *
 * - la regla está en el tema, fuera de cualquier `@layer` (como la inyecta el CDK);
 * - con las mismas declaraciones que `@angular/cdk/a11y-prebuilt.css` del cdk instalado
 *   (alarma: si el CDK cambia su regla, esta prueba lo avisa).
 *
 * Las pruebas corren en Node: se leen los archivos con fs (ver imports.spec.ts).
 */
const vhNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const vhFs = vhNode.getBuiltinModule('node:fs') as { readFileSync(p: string, e: 'utf8'): string };
const vhRead = (p: string) => vhFs.readFileSync(`${vhNode.cwd()}/${p}`, 'utf8');

const VH_THEME = vhRead('packages/ui-core/src/lib/theme/theme-base.css');
const VH_CDK = vhRead('node_modules/@angular/cdk/a11y-prebuilt.css');

/** Las declaraciones de la primera regla con ese selector exacto, normalizadas y ordenadas. */
function vhDeclarations(css: string, selector: string): string[] | null {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`).exec(clean);
  if (!match) return null;
  return match[1]
    .split(';')
    .map((d) =>
      d
        .trim()
        .replace(/\s*:\s*/, ': ')
        .replace(/"/g, "'"),
    )
    .filter(Boolean)
    .sort();
}

/** Profundidad de llaves en la posición: 0 es fuera de cualquier bloque (`@layer` incluido). */
function vhDepthAt(css: string, index: number): number {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  return depth;
}

describe('theme-base.css: .cdk-visually-hidden (anuncios del LiveAnnouncer)', () => {
  it('tiene las mismas declaraciones que a11y-prebuilt.css del cdk instalado', () => {
    const cdk = vhDeclarations(VH_CDK, '.cdk-visually-hidden');
    expect(cdk).not.toBeNull();
    expect(vhDeclarations(VH_THEME, '.cdk-visually-hidden')).toEqual(cdk);
  });

  it('y la variante RTL', () => {
    const cdk = vhDeclarations(VH_CDK, '[dir=rtl] .cdk-visually-hidden');
    expect(cdk).not.toBeNull();
    expect(vhDeclarations(VH_THEME, "[dir='rtl'] .cdk-visually-hidden")).toEqual(cdk);
  });

  it('va fuera de cualquier @layer, como la inyecta el CDK', () => {
    const clean = VH_THEME.replace(/\/\*[\s\S]*?\*\//g, '');
    const index = clean.search(/(?:^|\n)\.cdk-visually-hidden\s*\{/);
    expect(index).toBeGreaterThan(-1);
    expect(vhDepthAt(clean, index)).toBe(0);
  });
});
