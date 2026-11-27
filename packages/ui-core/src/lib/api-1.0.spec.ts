/**
 * La API pública congelada (1.0-6): lo que exporta el `index.ts` de cada carpeta de ui-core
 * (componentes, `utils` y `theme`) tiene que ser exactamente la lista «Exports» de su sección en
 * `docs/spec/api-1.0.md`. Así nada entra ni sale de la API sin pasar por el documento (y, desde la
 * 1.0.0, por la política de compatibilidad de la spec 12).
 *
 * Como `imports.spec.ts`, lee los archivos con fs (Vitest corre en Node) sin importarlos.
 */
// Un módulo, no un script: sin esto, sus `const` chocan con las de `imports.spec.ts` (TS2451).
export {};

interface Dirent {
  name: string;
  isDirectory(): boolean;
}
interface NodeFs {
  readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
  existsSync(path: string): boolean;
}
interface NodePath {
  join(...parts: string[]): string;
  dirname(path: string): string;
}
declare const process: { cwd(): string; getBuiltinModule(id: string): unknown };

const fs = process.getBuiltinModule('node:fs') as NodeFs;
const path = process.getBuiltinModule('node:path') as NodePath;

const ROOT = path.join(process.cwd(), 'packages', 'ui-core', 'src', 'lib');
const DOC = path.join(process.cwd(), 'docs', 'spec', 'api-1.0.md');

/** Los nombres que declara un archivo con `export class|interface|type|const|function`. */
function declared(file: string): string[] {
  const src = fs.readFileSync(file, 'utf8');
  return [
    ...src.matchAll(
      /^export (?:declare )?(?:abstract )?(?:class|interface|type|const|function|enum) (\w+)/gm,
    ),
  ].map(([, name]) => name);
}

/** Lo que exporta un `index.ts`: resuelve `export * from './x'` y `export { a, type b } from …`. */
function indexExports(index: string): string[] {
  const dir = path.dirname(index);
  const src = fs.readFileSync(index, 'utf8').replace(/\/\/.*$/gm, '');
  const names: string[] = [];
  for (const [, file] of src.matchAll(/export \*\s+from\s+'\.\/([^']+)'/g)) {
    names.push(...declared(path.join(dir, `${file}.ts`)));
  }
  for (const [, list] of src.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'[^']+'/g)) {
    for (const part of list.split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop();
      if (name) names.push(name);
    }
  }
  return [...new Set(names)].sort();
}

/** Las carpetas con `index.ts`: cada componente, `utils` y `theme`. */
function folders(): { name: string; index: string }[] {
  const components = fs
    .readdirSync(path.join(ROOT, 'components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      index: path.join(ROOT, 'components', entry.name, 'index.ts'),
    }))
    .filter(({ index }) => fs.existsSync(index));
  return [
    ...components,
    { name: 'utils', index: path.join(ROOT, 'utils', 'index.ts') },
    { name: 'theme', index: path.join(ROOT, 'theme', 'index.ts') },
  ];
}

/** La lista «Exports» de cada sección `### <carpeta>` del documento. */
function documented(): Map<string, string[]> {
  const doc = fs.readFileSync(DOC, 'utf8');
  const out = new Map<string, string[]>();
  for (const section of doc.split(/^### /m).slice(1)) {
    const name = section.slice(0, section.indexOf('\n')).trim();
    const line = section.split('\n').find((l) => l.startsWith('- **Exports**'));
    if (!line) continue;
    const list = line.slice(line.indexOf(':') + 1);
    out.set(name, [...list.matchAll(/`([\w$]+)`/g)].map(([, n]) => n).sort());
  }
  return out;
}

describe('API pública congelada (docs/spec/api-1.0.md)', () => {
  const doc = documented();

  it('el documento tiene una sección por carpeta de ui-core, y ninguna de más', () => {
    const names = folders()
      .map((f) => f.name)
      .sort();
    expect([...doc.keys()].sort()).toEqual(names);
    expect(names.length).toBeGreaterThan(45);
  });

  it('cada index.ts exporta exactamente la lista del documento', () => {
    const differences = folders().flatMap(({ name, index }) => {
      const actual = indexExports(index);
      const listed = doc.get(name) ?? [];
      const extra = actual.filter((n) => !listed.includes(n));
      const missing = listed.filter((n) => !actual.includes(n));
      return [
        ...extra.map((n) => `${name}: exporta ${n}, que no está en api-1.0.md`),
        ...missing.map((n) => `${name}: api-1.0.md lista ${n}, que el index.ts no exporta`),
      ];
    });
    expect(differences).toEqual([]);
  });
});
