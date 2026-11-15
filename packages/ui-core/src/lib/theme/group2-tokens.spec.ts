/**
 * Globales del Grupo 2 en theme-base.css (plan, G2.0b; spec 13, «Otros globales del diseño»).
 *
 * - Valores en claro y oscuro iguales a los escritos aquí (`G2_EXPECTED`), y keyframes con el
 *   cuerpo escrito aquí. **El código es la fuente de verdad del diseño** (decidido por el usuario
 *   el 14/11/2026, PD-5): la prueba ya no lee docs/design/ (referencia histórica). Los valores
 *   salieron de tokens-mimi.css y de `F5 Estructura`; si uno cambia a propósito, se cambia aquí
 *   también, y la prueba avisa si cambia por accidente.
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

/** Valores de hoy (14/11/2026) en claro y oscuro, tal como los deja `g2Flat`. */
const G2_EXPECTED: Record<string, readonly [light: string, dark: string]> = {
  range: [
    'color-mix(in oklab, var(--mimi-primary) 9%, var(--mimi-background))',
    'color-mix(in oklab, var(--mimi-primary) 14%, var(--mimi-background))',
  ],
  track: [
    'color-mix(in oklab, var(--mimi-foreground) 12%, var(--mimi-background))',
    'color-mix(in oklab, var(--mimi-foreground) 16%, var(--mimi-background))',
  ],
  'track-fill': ['var(--mimi-primary)', 'var(--mimi-primary)'],
  thumb: ['oklch(1 0 0)', 'oklch(0.985 0 0)'],
  chip: ['var(--mimi-secondary)', 'var(--mimi-secondary)'],
  'chip-foreground': ['var(--mimi-secondary-foreground)', 'var(--mimi-secondary-foreground)'],
  dropzone: [
    'color-mix(in oklab, var(--mimi-muted) 55%, var(--mimi-background))',
    'color-mix(in oklab, var(--mimi-muted) 50%, var(--mimi-background))',
  ],
  // La marca, no `info` (decidido por el usuario el 12/11/2026).
  'dropzone-active': ['var(--mimi-primary-subtle)', 'var(--mimi-primary-subtle)'],
  'dropzone-active-border': ['var(--mimi-ring)', 'var(--mimi-ring)'],
  'strength-weak': ['var(--mimi-destructive)', 'var(--mimi-destructive)'],
  'strength-medium': ['var(--mimi-warning)', 'var(--mimi-warning)'],
  'strength-strong': ['var(--mimi-success)', 'var(--mimi-success)'],
  selection: ['var(--mimi-info)', 'var(--mimi-info)'],
};

/** Cuerpo de los keyframes de hoy, como los deja `g2Keyframes` (sin espacios). */
const G2_KEYFRAMES: Record<string, string> = {
  'mimi-caret': '{50%{opacity:0}}',
  'mimi-bob': '{50%{transform:translateY(-4px)}}',
  'mimi-shake': '{20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}',
  'mimi-indet': '{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}',
};

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
  const themeDark = new Map([...themeLight, ...g2Vars(G2_THEME, '.dark')]);

  it('la lista de valores esperados cubre todos los globales', () => {
    expect(Object.keys(G2_EXPECTED).sort()).toEqual([...G2_GLOBALS].sort());
  });

  it.each(G2_GLOBALS)('--mimi-%s vale lo esperado, en claro y oscuro', (name) => {
    const [light, dark] = G2_EXPECTED[name];
    expect(themeLight.get(name)).toBe(light);
    expect(themeDark.get(name)).toBe(dark);
  });

  it.each(G2_GLOBALS)('--mimi-%s se expone a Tailwind con @theme inline', (name) => {
    expect(G2_THEME).toContain(`--color-${name}: var(--mimi-${name});`);
  });

  it.each(Object.keys(G2_KEYFRAMES))('@keyframes %s tiene el cuerpo esperado', (name) => {
    expect(g2Keyframes(G2_THEME, name)).toBe(G2_KEYFRAMES[name]);
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
