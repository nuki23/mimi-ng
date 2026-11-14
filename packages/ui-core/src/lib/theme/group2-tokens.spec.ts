/**
 * Globales del Grupo 2 en theme-base.css (plan, G2.0b; spec 13, «Otros globales del diseño»).
 *
 * - Valores iguales a los de docs/design/tokens-mimi.css, en claro y oscuro.
 * - Keyframes con el mismo cuerpo que el diseño (mimi-indet sale de `F5 Estructura`).
 * - Expuestos a Tailwind con @theme inline.
 * - Compatibilidad con un tema anterior a la 0.3.0: ningún componente lee estos globales sin
 *   valor de respaldo (`var(--mimi-track, …)`), ni con una utilidad de Tailwind que no lo tiene
 *   (`bg-track`), ni con un respaldo transparente. Así, con el tema viejo, no quedan invisibles.
 *
 * Las pruebas corren en Node: se leen los archivos con fs (ver imports.spec.ts).
 */
interface G2Dirent {
  name: string;
  isDirectory(): boolean;
}
const g2Node = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const g2Fs = g2Node.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
  readdirSync(p: string, o: { withFileTypes: true }): G2Dirent[];
};
const g2Root = g2Node.cwd();
const g2Read = (p: string) => g2Fs.readFileSync(`${g2Root}/${p}`, 'utf8');

const G2_THEME = g2Read('packages/ui-core/src/lib/theme/theme-base.css');
const G2_DESIGN = g2Read('docs/design/tokens-mimi.css');
const G2_STRUCTURE = g2Read('docs/design/Mimi F5 Estructura.dc.html');

const G2_GLOBALS = [
  'range',
  'track',
  'track-fill',
  'thumb',
  'chip',
  'chip-foreground',
  'dropzone',
  'dropzone-active',
  'dropzone-active-border',
  'strength-weak',
  'strength-medium',
  'strength-strong',
  'selection',
];

/** Texto sin saltos ni espacios de más (Prettier parte los color-mix largos). */
const g2Flat = (text: string) =>
  text.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim();

/** Variables --mimi-* del bloque que empieza en la línea `selector {`. */
function g2Vars(css: string, selector: string): Map<string, string> {
  const start = css.indexOf(`\n${selector} {`);
  const body = css.slice(start, css.indexOf('\n}', start + 1));
  const vars = new Map<string, string>();
  for (const m of body.matchAll(/--mimi-([a-z0-9-]+):\s*([^;]+);/g)) vars.set(m[1], g2Flat(m[2]));
  return vars;
}

/** Cuerpo de un @keyframes, sin espacios, para comparar CSS con y sin formato. */
function g2Keyframes(css: string, name: string): string {
  const start = css.indexOf(`@keyframes ${name}`);
  if (start < 0) return '';
  let depth = 0;
  let i = css.indexOf('{', start);
  const from = i;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) break;
  }
  return css
    .slice(from, i + 1)
    .replace(/\s+/g, '')
    .replace(/\b0\./g, '.')
    .replace(/;}/g, '}');
}

function g2Files(dir: string): string[] {
  return g2Fs.readdirSync(`${g2Root}/${dir}`, { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return entry.name === 'theme' ? [] : g2Files(rel);
    return /\.(ts|html|css)$/.test(entry.name) && !entry.name.endsWith('.spec.ts') ? [rel] : [];
  });
}

describe('theme-base.css: globales del Grupo 2 (G2.0b)', () => {
  const themeLight = g2Vars(G2_THEME, ':root');
  const themeDark = g2Vars(G2_THEME, '.dark');
  const designLight = g2Vars(G2_DESIGN, ':root');
  const designDark = new Map([...designLight, ...g2Vars(G2_DESIGN, '.dark')]);

  /**
   * Lo que Mimi hace distinto del diseño a propósito (anotado en correcciones-pendientes.md): la
   * zona de File Upload con un archivo encima usa la marca, no `info` (decidido por el usuario,
   * 12/11/2026). El diseño tiene que seguir teniendo la variable.
   */
  const G2_OVERRIDES: Record<string, string> = {
    'dropzone-active': 'var(--mimi-primary-subtle)',
    'dropzone-active-border': 'var(--mimi-ring)',
  };

  it.each(G2_GLOBALS)(
    '--mimi-%s vale lo mismo que en tokens-mimi.css, en claro y oscuro',
    (name) => {
      expect(designLight.get(name), 'falta en el diseño').toBeDefined();
      const override = G2_OVERRIDES[name];
      expect(themeLight.get(name)).toBe(override ?? designLight.get(name));
      expect(themeDark.get(name)).toBe(override ?? designDark.get(name));
    },
  );

  it.each(G2_GLOBALS)('--mimi-%s se expone a Tailwind con @theme inline', (name) => {
    expect(G2_THEME).toContain(`--color-${name}: var(--mimi-${name});`);
  });

  it.each(['mimi-caret', 'mimi-bob', 'mimi-shake'])(
    '@keyframes %s tiene el mismo cuerpo que tokens-mimi.css',
    (name) => {
      expect(g2Keyframes(G2_THEME, name)).not.toBe('');
      expect(g2Keyframes(G2_THEME, name)).toBe(g2Keyframes(G2_DESIGN, name));
    },
  );

  it('@keyframes mimi-indet tiene el mismo cuerpo que F5 Estructura', () => {
    expect(g2Keyframes(G2_THEME, 'mimi-indet')).not.toBe('');
    expect(g2Keyframes(G2_THEME, 'mimi-indet')).toBe(g2Keyframes(G2_STRUCTURE, 'mimi-indet'));
  });

  it('--mimi-corner-shape no entra (es del Theme Studio)', () => {
    expect(G2_THEME).not.toContain('--mimi-corner-shape');
  });
});

describe('compatibilidad con un tema sin los globales del Grupo 2 (G2.0b)', () => {
  const files = g2Files('packages/ui-core/src/lib').map((f) => [f, g2Read(f)] as const);
  const names = [...G2_GLOBALS].sort((a, b) => b.length - a.length).join('|');
  const bare = new RegExp(String.raw`var\(--mimi-(${names})\)`, 'g');
  const transparent = new RegExp(String.raw`var\(--mimi-(${names}),\s*transparent\)`, 'g');
  // Sin `shadow-`: `shadow-thumb` es la sombra `--mimi-shadow-thumb` (Switch), no un color.
  const utility = new RegExp(
    String.raw`(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|accent|caret|decoration)-(${names})(?![\w-])`,
    'g',
  );

  it('encuentra los archivos de los componentes', () => {
    expect(files.some(([f]) => f.endsWith('button/button.ts'))).toBe(true);
  });

  it('ningún componente usa un global del Grupo 2 sin valor de respaldo', () => {
    const found = files.flatMap(([f, src]) => [...src.matchAll(bare)].map((m) => `${f}: ${m[0]}`));
    expect(found).toEqual([]);
  });

  it('ningún respaldo es transparente (el componente quedaría invisible)', () => {
    const found = files.flatMap(([f, src]) =>
      [...src.matchAll(transparent)].map((m) => `${f}: ${m[0]}`),
    );
    expect(found).toEqual([]);
  });

  it('ningún componente usa la utilidad de Tailwind sin respaldo (bg-track, text-chip-foreground…)', () => {
    const found = files.flatMap(([f, src]) =>
      [...src.matchAll(utility)].map((m) => `${f}: ${m[0]}`),
    );
    expect(found).toEqual([]);
  });
});
