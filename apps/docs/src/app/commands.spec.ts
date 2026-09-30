/**
 * El sitio y los READMEs no muestran comandos que hoy no funcionan (tareas 3.9 y L.1). El
 * comando `mimi` todavía no existe (tarea 5.3): `mimi add`, `mimi list` y `mimi theme` no pueden
 * aparecer. `mimi update` (tarea 5.4) solo puede aparecer en archivos que lo marcan como futuro.
 *
 * Cuando exista el comando `mimi`, actualizar esta lista (anotado en la tarea 5.3).
 *
 * Las pruebas corren en Node (Vitest): se leen los archivos con fs sin importarlo, como en
 * packages/ui-core/src/lib/imports.spec.ts.
 */
interface Dirent {
  name: string;
  isDirectory(): boolean;
}
interface NodeFs {
  readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
}
interface NodePath {
  join(...parts: string[]): string;
  relative(from: string, to: string): string;
}
declare const process: { cwd(): string; getBuiltinModule(id: string): unknown };

const fs = process.getBuiltinModule('node:fs') as NodeFs;
const path = process.getBuiltinModule('node:path') as NodePath;

const ROOT = path.join(process.cwd(), 'apps', 'docs', 'src', 'app');

// Se arman por partes para que este archivo no se detecte a sí mismo.
const NOT_YET = ['add', 'list', 'theme'].map((cmd) => new RegExp(`\\bmimi ${cmd}\\b`));
const UPDATE = new RegExp(`\\bmimi ${'update'}\\b`);
const MARKED_FUTURE = /próximamente|versión futura/i;

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(full);
    const source = /\.(ts|html)$/.test(entry.name) && !entry.name.endsWith('.spec.ts');
    return source ? [full] : [];
  });
}

describe('comandos del sitio', () => {
  // El sitio y los READMEs (GitHub y npm): la misma regla.
  const readmes = [
    path.join(process.cwd(), 'README.md'),
    path.join(process.cwd(), 'packages', 'cli', 'README.md'),
  ];
  const all = [...files(ROOT), ...readmes];

  it('revisa también los READMEs', () => {
    for (const readme of readmes) expect(fs.readFileSync(readme, 'utf8').length).toBeGreaterThan(0);
  });

  it('encuentra los archivos del sitio', () => {
    expect(all.some((f) => f.endsWith(path.join('pages', 'home-page.html')))).toBe(true);
  });

  it('no muestra comandos de mimi que todavía no existen', () => {
    const offenders = all.filter((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return NOT_YET.some((re) => re.test(text));
    });
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });

  it('mimi update solo aparece marcado como futuro', () => {
    const offenders = all.filter((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return UPDATE.test(text) && !MARKED_FUTURE.test(text);
    });
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
