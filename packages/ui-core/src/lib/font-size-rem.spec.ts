/**
 * Tamaños de texto en rem (22/11/2026, pedido del usuario): crecen con el tamaño de letra que
 * elige quien usa el navegador (WCAG 1.4.4). Ninguna clase de tamaño de texto con px
 * (`text-[13px]`, ni el respaldo de `text-[length:var(--x,13px)]`), ni un token de texto del tema
 * con px. Lee los archivos con fs, como fixed-colors.spec.ts (nombres propios para no chocar con
 * otras pruebas). El aspecto con el tamaño normal no cambia: 13px = 0,8125rem.
 */
interface RemDirent {
  name: string;
  isDirectory(): boolean;
}
const remNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const remFs = remNode.getBuiltinModule('node:fs') as {
  readdirSync(path: string, options: { withFileTypes: true }): RemDirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
};
const remPath = remNode.getBuiltinModule('node:path') as {
  join(...parts: string[]): string;
  relative(from: string, to: string): string;
};
const REM_ROOT = remPath.join(remNode.cwd(), 'packages', 'ui-core', 'src', 'lib');

function remSources(dir: string): string[] {
  return remFs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = remPath.join(dir, entry.name);
    if (entry.isDirectory()) return remSources(full);
    const source = entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts');
    // También las plantillas .html de los Blocks (revisor de la tanda 2, H1: se habían quedado).
    return source || entry.name.endsWith('.css') || entry.name.endsWith('.html') ? [full] : [];
  });
}

const REM_PATTERNS: [string, RegExp][] = [
  ['text-[Npx]', /\btext-\[\d+(?:\.\d+)?px\]/g],
  ['text-[length:…px…]', /\btext-\[length:[^\]\s]*\d(?:\.\d+)?px[^\]\s]*\]/g],
  // Hasta el fin del valor (`;` en CSS; `]` o un espacio en una clase como `[--x:20px]`).
  ['font-size en px', /font-size:\s*[^;\]\s]*\d(?:\.\d+)?px/g],
  [
    'token de texto del tema en px',
    /--mimi-[a-z0-9-]*(?:text|font-size|title|desc|hint)[a-z0-9-]*:\s*(?:var\([^;\]]*|[^;\]\s]*)\d(?:\.\d+)?px/g,
  ],
];

describe('Tamaños de texto en rem en toda la librería', () => {
  const files = remSources(REM_ROOT);

  it('encuentra los componentes, los Blocks, las utilidades y el tema', () => {
    const rel = files.map((f) => remPath.relative(REM_ROOT, f).replace(/\\/g, '/'));
    expect(rel).toContain('theme/theme-base.css');
    expect(rel).toContain('components/menu/menu.ts');
    expect(rel.some((f) => f.startsWith('blocks/'))).toBe(true);
    expect(rel).toContain('blocks/login-01/login-01.html');
  });

  it.each(REM_PATTERNS)('sin %s', (_, pattern) => {
    const found = files.flatMap((file) =>
      [...remFs.readFileSync(file, 'utf8').matchAll(pattern)].map(
        (m) => `${remPath.relative(REM_ROOT, file).replace(/\\/g, '/')}: ${m[0]}`,
      ),
    );
    expect(found).toEqual([]);
  });
});
