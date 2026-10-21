/**
 * Avisos en modo desarrollo: todos con el mismo formato, «[Mimi] Componente: …», para que se
 * reconozcan y se puedan filtrar en la consola. Lee los archivos con fs, como imports.spec.ts
 * (nombres propios para no chocar con sus declaraciones globales).
 */
interface WarningsDirent {
  name: string;
  isDirectory(): boolean;
}
interface WarningsFs {
  readdirSync(path: string, options: { withFileTypes: true }): WarningsDirent[];
  readFileSync(path: string, encoding: 'utf8'): string;
}
interface WarningsPath {
  join(...parts: string[]): string;
  relative(from: string, to: string): string;
}
const warningsNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const warningsFs = warningsNode.getBuiltinModule('node:fs') as WarningsFs;
const warningsPath = warningsNode.getBuiltinModule('node:path') as WarningsPath;
const WARNINGS_ROOT = warningsPath.join(warningsNode.cwd(), 'packages', 'ui-core', 'src', 'lib');

function warningSources(dir: string): string[] {
  return warningsFs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = warningsPath.join(dir, entry.name);
    if (entry.isDirectory()) return warningSources(full);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

/** El primer texto después de `console.warn(` o `console.error(`, con su comilla. */
const CALL = /console\.(?:warn|error)\(\s*(['"`])((?:\\.|(?!\1).)*)/g;
const FORMAT = /^\[Mimi\] [A-Z][A-Za-z ]+: /;

describe('avisos en modo desarrollo', () => {
  const calls = warningSources(WARNINGS_ROOT).flatMap((file) =>
    [...warningsFs.readFileSync(file, 'utf8').matchAll(CALL)].map((match) => ({
      file: warningsPath.relative(WARNINGS_ROOT, file),
      message: match[2],
    })),
  );

  it('encuentra los avisos de los componentes y del tema', () => {
    expect(calls.length).toBeGreaterThan(8);
  });

  it('todos empiezan con «[Mimi] Componente: »', () => {
    const wrong = calls.filter((call) => !FORMAT.test(call.message));
    expect(wrong).toEqual([]);
  });
});
