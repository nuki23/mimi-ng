/**
 * Foco visible (CLAUDE.md, estilos 11). En Tailwind 4, `outline-none` pone `--tw-outline-style` en
 * `none`, y `focus-visible:outline-2` usa esa variable: si un elemento tiene las dos clases, el
 * anillo de foco no se ve (pasó en Tabs y en el toast enfocado con F8). Por eso:
 * - cada `outline-none` de ui-core está en la lista de abajo, con la forma en que ese elemento
 *   muestra el foco (o por qué no la necesita): uno nuevo falla hasta que alguien lo revise;
 * - `outline-none` no puede estar en el mismo bloque que un anillo de contorno
 *   (`buttonFocusStyles` o `focus-visible:outline-<ancho>`).
 *
 * Igual que imports.spec.ts: se leen los archivos con fs (sin @types/node). Las pruebas se
 * compilan como scripts globales, así que los nombres no repiten los de imports.spec.ts.
 */
interface FocusDirent {
  name: string;
  isDirectory(): boolean;
}
interface FocusFs {
  readdirSync(path: string, options: { withFileTypes: true }): FocusDirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
}
interface FocusPath {
  join(...parts: string[]): string;
  relative(from: string, to: string): string;
}
const focusNode = (
  globalThis as unknown as {
    process: { cwd(): string; getBuiltinModule(id: string): unknown };
  }
).process;
const focusFs = focusNode.getBuiltinModule('node:fs') as FocusFs;
const focusPath = focusNode.getBuiltinModule('node:path') as FocusPath;

const FOCUS_ROOT = focusPath.join(focusNode.cwd(), 'packages', 'ui-core', 'src', 'lib');

/** Archivo (relativo a lib, con /) → cuántos `outline-none` tiene y cómo se ve el foco. */
const ALLOWED: Record<string, { count: number; why: string }> = {
  'utils/control-styles.ts': {
    count: 1,
    why: 'Input y Textarea: el foco es el borde y el halo ring (box-shadow), no el contorno.',
  },
  'components/menu/menu.ts': {
    count: 2,
    why: 'Panel (el foco va a las opciones) y opción: la activa se marca con el fondo.',
  },
  'components/select/select.ts': {
    count: 4,
    why: 'Botón: el anillo lo pinta la caja con has-[[role=combobox]:focus]. Lista y panel: la opción activa lleva fondo. Buscador: tiene el cursor de texto y la opción activa.',
  },
  'components/popover/popover.ts': {
    count: 1,
    why: 'Panel: recibe el foco al abrir solo si no hay nada enfocable dentro (cdk).',
  },
  'components/dialog/dialog.ts': {
    count: 2,
    why: 'Panel y contenedor del cdk: reciben el foco al abrir (autoFocus) para que el lector lea el título.',
  },
  'components/toast/toast.ts': {
    count: 1,
    why: 'La región de los toasts (tabindex="-1"): F8 lleva el foco a un toast, que tiene su anillo.',
  },
};

/** `outline-none` como clase (también con variante, `[&>x]:outline-none`), sin comentarios. */
function outlineNone(code: string): number[] {
  const lines = withoutComments(code).split('\n');
  return lines.flatMap((line, i) => (/(?<![\w-])outline-none(?![\w-])/.test(line) ? [i] : []));
}

/** Líneas con un anillo de contorno: buttonFocusStyles o focus-visible:outline-<ancho>. */
function outlineRings(code: string): number[] {
  const lines = withoutComments(code).split('\n');
  return lines.flatMap((line, i) =>
    /buttonFocusStyles|focus-visible:outline-(\d|\[)/.test(line) ? [i] : [],
  );
}

/** Quita los comentarios sin mover las líneas (para que los números coincidan). */
function withoutComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * `outline-none` en el mismo bloque (líneas seguidas, sin una en blanco) que un anillo de
 * contorno: así se escriben las clases de un elemento (una constante, un `cn()`, un `cva()`).
 */
function clashes(code: string): number[] {
  let block = 0;
  const blocks = withoutComments(code)
    .split('\n')
    .map((line) => (line.trim() ? block : ++block));
  const rings = new Set(outlineRings(code).map((line) => blocks[line]));
  return outlineNone(code).filter((line) => rings.has(blocks[line]));
}

function sourceFiles(dir: string): string[] {
  return focusFs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = focusPath.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

describe('foco visible en ui-core', () => {
  const files = sourceFiles(FOCUS_ROOT).map((file) => ({
    name: focusPath.relative(FOCUS_ROOT, file).replaceAll('\\', '/'),
    code: focusFs.readFileSync(file, 'utf8'),
  }));

  it('cada outline-none está en la lista, con la forma en que se ve el foco', () => {
    const found = Object.fromEntries(
      files
        .map(({ name, code }) => [name, outlineNone(code).length] as const)
        .filter(([, count]) => count > 0),
    );
    const allowed = Object.fromEntries(
      Object.entries(ALLOWED).map(([name, { count }]) => [name, count]),
    );
    expect(found).toEqual(allowed);
  });

  it('ningún outline-none junto a un anillo de contorno (lo anularía)', () => {
    const offenders = files.flatMap(({ name, code }) =>
      clashes(code).map((line) => `${name}:${line + 1}`),
    );
    expect(offenders).toEqual([]);
  });

  it('la regla detecta el choque y no cuenta los comentarios', () => {
    expect(clashes(`cn('px-0.5 outline-none', buttonFocusStyles)`)).toEqual([0]);
    expect(clashes(`'block outline-none',\n'x',\n'focus-visible:outline-2 outline-ring'`)).toEqual([
      0,
    ]);
    expect(clashes(`'outline-none focus-visible:ring-3'`)).toEqual([]);
    // Otra constante (separada por una línea en blanco) es otro elemento.
    expect(clashes(`const A = 'outline-none';\n\nconst B = cn(buttonFocusStyles);`)).toEqual([]);
    expect(outlineNone(`// sin outline-none\n'[&>.x]:outline-none'`)).toEqual([1]);
    expect(outlineNone(`'focus-visible:outline-none-ish outline-nonex'`)).toEqual([]);
  });
});
