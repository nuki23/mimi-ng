/**
 * Colores fijos (informe del usuario, 12/11/2026: «Sortable List usa azul fijo»). Los componentes
 * sacan sus colores del tema: ni hex, ni rgb(), ni clases de la paleta de Tailwind (`blue-500`,
 * `gray-200`…), ni `bg-white`/`text-black`. Las excepciones van con su razón. Lee los archivos
 * con fs, como imports.spec.ts (nombres propios para no chocar con otras pruebas).
 */
interface FixedDirent {
  name: string;
  isDirectory(): boolean;
}
const fixedNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const fixedFs = fixedNode.getBuiltinModule('node:fs') as {
  readdirSync(path: string, options: { withFileTypes: true }): FixedDirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
};
const fixedPath = fixedNode.getBuiltinModule('node:path') as {
  join(...parts: string[]): string;
  relative(from: string, to: string): string;
};
const FIXED_ROOT = fixedPath.join(
  fixedNode.cwd(),
  'packages',
  'ui-core',
  'src',
  'lib',
  'components',
);

function fixedSources(dir: string): string[] {
  return fixedFs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = fixedPath.join(dir, entry.name);
    if (entry.isDirectory()) return fixedSources(full);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

const FIXED_PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const FIXED_PATTERNS: [string, RegExp][] = [
  ['hex', /#[0-9a-fA-F]{3,8}\b(?![-\w])/g],
  ['rgb()', /\brgba?\(/g],
  ['paleta de Tailwind', new RegExp(`\\b[a-z]+-(?:${FIXED_PALETTE})-\\d{2,3}\\b`, 'g')],
  ['blanco o negro', /\b(?:bg|text|border|ring|fill|stroke)-(?:white|black)\b/g],
  ['oklch() fijo', /oklch\(\s*[\d.]+[\s_]+[\d.]+[\s_]+[\d.]+/g],
];

/** Excepciones con su razón: archivo → cuántas coincidencias se permiten. */
const FIXED_ALLOWED: Record<string, { count: number; why: string }> = {
  'color-picker/color-picker.ts': {
    count: 16,
    why: 'El espectro de tonos y el área de saturación son colores reales (rgb), y el pulgar blanco con sombra negra tiene que verse sobre cualquier color; todos llevan su token de Color Picker. Los hex de los comentarios documentan el formato.',
  },
  'color-picker/color.ts': {
    count: 5,
    why: 'Conversión de colores: ejemplos de formato en los comentarios.',
  },
  'data-table/data-table.ts': {
    count: 1,
    why: 'La sombra de las columnas fijas es negra como las sombras del tema (--mimi-shadow-*), con su token --mimi-table-sticky-shadow.',
  },
};

describe('Colores fijos en los componentes', () => {
  const found = fixedSources(FIXED_ROOT).map((file) => {
    const text = fixedFs.readFileSync(file, 'utf8');
    const hits = FIXED_PATTERNS.flatMap(([kind, re]) =>
      [...text.matchAll(re)].map((m) => `${kind}: ${m[0]}`),
    );
    return { file: fixedPath.relative(FIXED_ROOT, file).replaceAll('\\', '/'), hits };
  });

  it('ningún componente usa colores fijos fuera de las excepciones', () => {
    const wrong = found
      .filter(({ file, hits }) => hits.length > (FIXED_ALLOWED[file]?.count ?? 0))
      .map(({ file, hits }) => `${file}: ${hits.join(', ')}`);
    expect(wrong).toEqual([]);
  });

  it('las excepciones siguen haciendo falta (si bajan, se actualiza el número)', () => {
    for (const [file, { count }] of Object.entries(FIXED_ALLOWED)) {
      expect(found.find((f) => f.file === file)?.hits.length, file).toBe(count);
    }
  });

  it('Sortable List arrastra con el color de la marca, no con el azul de info', () => {
    const text = fixedFs.readFileSync(
      fixedPath.join(FIXED_ROOT, 'sortable-list', 'sortable-list.ts'),
      'utf8',
    );
    expect(text).not.toContain('var(--mimi-info');
    expect(text).toContain('var(--mimi-sortable-drop,var(--mimi-ring))');
    expect(text).toContain('var(--mimi-sortable-drop-bg,var(--mimi-primary-subtle))');
  });
});
