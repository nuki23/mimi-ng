/**
 * Presupuesto del JS inicial (apps/docs/scripts/check-initial-js.mjs, spec 10): el script suma el
 * <script type="module"> y los <link rel="modulepreload"> de index.html, avisa desde 335 kB y
 * falla desde 350 kB. Se prueba con un index.html de ejemplo en una carpeta temporal.
 *
 * Las pruebas corren en Node (Vitest), con los módulos de Node sin importarlos, como en
 * public-files.spec.ts. Sin imports, los dos archivos comparten ámbito: los nombres de aquí son
 * distintos de los de allá.
 */

interface InitialJsFs {
  mkdtempSync(prefix: string): string;
  writeFileSync(path: string, data: string): void;
  rmSync(path: string, options: { recursive: true; force: true }): void;
}
interface InitialJsSpawnResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

const initialJsNode = (
  globalThis as unknown as {
    process: { cwd(): string; execPath: string; getBuiltinModule(id: string): unknown };
  }
).process;
const initialJsFs = initialJsNode.getBuiltinModule('node:fs') as InitialJsFs;
const initialJsPath = initialJsNode.getBuiltinModule('node:path') as {
  join(...parts: string[]): string;
};
const initialJsOs = initialJsNode.getBuiltinModule('node:os') as { tmpdir(): string };
const initialJsSpawn = (
  initialJsNode.getBuiltinModule('node:child_process') as {
    spawnSync(command: string, args: string[], options: { encoding: 'utf8' }): InitialJsSpawnResult;
  }
).spawnSync;

const INITIAL_JS_SCRIPT = initialJsPath.join(
  initialJsNode.cwd(),
  'apps',
  'docs',
  'scripts',
  'check-initial-js.mjs',
);

const INDEX_HTML = `<!doctype html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="styles.css">
  <link rel="modulepreload" href="chunk-a.js">
  <link rel="modulepreload" href="chunk-b.js">
</head>
<body>
  <script>document.documentElement.classList.add('x');</script>
  <script src="main.js" type="module"></script>
  <script src="https://cdn.example.com/externo.js" type="module"></script>
</body>
</html>`;

describe('check-initial-js.mjs (presupuesto del JS inicial)', () => {
  let dir = '';
  const write = (name: string, kB: number) =>
    initialJsFs.writeFileSync(initialJsPath.join(dir, name), 'x'.repeat(kB * 1000));
  const run = () =>
    initialJsSpawn(initialJsNode.execPath, [INITIAL_JS_SCRIPT, dir], { encoding: 'utf8' });

  beforeEach(() => {
    dir = initialJsFs.mkdtempSync(initialJsPath.join(initialJsOs.tmpdir(), 'mimi-initial-js-'));
    initialJsFs.writeFileSync(initialJsPath.join(dir, 'index.html'), INDEX_HTML);
    write('styles.css', 80);
    write('chunk-a.js', 180);
    write('chunk-b.js', 1);
    // No lo carga index.html: no cuenta.
    write('chunk-lazy.js', 500);
  });
  afterEach(() => initialJsFs.rmSync(dir, { recursive: true, force: true }));

  it('suma el script del módulo y los modulepreload, y el CSS una sola vez', () => {
    write('main.js', 130);
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('JS inicial: 311.00 kB crudo');
    expect(result.stdout).toContain('(3 archivos;');
    expect(result.stdout).toContain('CSS global: 80.00 kB crudo');
    expect(result.stdout).toMatch(/gzip, .* brotli/);
    expect(result.stderr).toBe('');
  });

  it('no avisa justo debajo de 335 kB', () => {
    write('main.js', 153);
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe('');
  });

  it('avisa desde 335 kB, sin fallar', () => {
    write('main.js', 154);
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('Aviso: el JS inicial (335.00 kB) pasa los 335 kB');
  });

  it('falla desde 350 kB', () => {
    write('main.js', 169);
    const result = run();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('pasa el límite de 350 kB');
  });
});
