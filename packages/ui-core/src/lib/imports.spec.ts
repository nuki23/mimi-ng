/**
 * Regla de importaciones de ui-core (CLAUDE.md, regla 9): los archivos se importan entre sí con
 * el alias y el archivo concreto (`@/components/ui/utils/cn`), nunca con el índice de utils o de
 * theme. El índice de utils reexporta field-state, que trae @angular/forms: si Button lo
 * importara, cualquier app que use solo Button cargaría los formularios completos.
 *
 * Las pruebas corren en Node (Vitest), así que leemos los archivos con fs sin importarlo: el
 * builder empaqueta la prueba para el navegador y no resolvería `node:fs`. Tampoco hay
 * @types/node: se declaran solo los tipos que se usan.
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

const ROOT = path.join(process.cwd(), 'packages', 'ui-core', 'src', 'lib');

// Se arma por partes para que este archivo no se detecte a sí mismo.
const BARREL = new RegExp(String.raw`from\s+['"]@/components/ui/` + String.raw`(utils|theme)['"]`);
const RELATIVE_OUTSIDE = /from\s+['"]\.\.\//;

function tsFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return tsFiles(full);
    return entry.name.endsWith('.ts') ? [full] : [];
  });
}

describe('importaciones de ui-core', () => {
  const files = tsFiles(ROOT);

  it('encuentra los archivos de ui-core', () => {
    expect(files.some((f) => f.endsWith(path.join('components', 'button', 'button.ts')))).toBe(
      true,
    );
  });

  it('ningún archivo importa el índice de utils o de theme', () => {
    const offenders = files
      .filter((file) => BARREL.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('ningún archivo usa rutas relativas que salgan de su carpeta', () => {
    const offenders = files
      .filter((file) => RELATIVE_OUTSIDE.test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(ROOT, file));
    expect(offenders).toEqual([]);
  });

  it('nada privado de @angular/aria ni @angular/cdk (decisión 4.3)', () => {
    const offenders = files.flatMap((file) =>
      privateAngularImports(fs.readFileSync(file, 'utf8')).map(
        (found) => `${path.relative(ROOT, file)}: ${found}`,
      ),
    );
    expect(offenders).toEqual([]);
  });

  it('la regla detecta entry points y símbolos privados', () => {
    const from = (spec: string) => ` from '@angular/${spec}';`;
    expect(privateAngularImports(`import { X }${from('cdk/private')}`)).toEqual(['cdk/private']);
    expect(privateAngularImports(`import { X }${from('aria/private')}`)).toEqual(['aria/private']);
    expect(privateAngularImports(`import { _Loader }${from('cdk/overlay')}`)).toEqual([
      'cdk/overlay: _Loader',
    ]);
    expect(privateAngularImports(`import { a, ɵb as c }${from('aria/menu')}`)).toEqual([
      'aria/menu: ɵb',
    ]);
    expect(privateAngularImports(`export { _x }${from('cdk/a11y')}`)).toEqual(['cdk/a11y: _x']);
    expect(privateAngularImports(`import { X }${from('cdk/fesm2022/overlay.mjs')}`)).toEqual([
      'cdk/fesm2022/overlay.mjs',
    ]);
    expect(
      privateAngularImports(
        `import { CdkConnectedOverlay, type ConnectedPosition }${from('cdk/overlay')}`,
      ),
    ).toEqual([]);
  });
});

/**
 * Importaciones de @angular/aria y @angular/cdk que no son API pública: el entry point `private`
 * (o una ruta interna como `fesm2022/…`) y los símbolos que empiezan por `_` o `ɵ`.
 */
function privateAngularImports(code: string): string[] {
  const found: string[] = [];
  // Se arma por partes para que este archivo no se detecte a sí mismo.
  const statement = new RegExp(
    String.raw`(?:import|export)\s*(?:type\s+)?(?:\{([^}]*)\}|[\w$*\s]+)\s*from\s*['"]@angular/` +
      String.raw`((?:aria|cdk)(?:/[^'"]*)?)['"]`,
    'g',
  );
  for (const [, names, entry] of code.matchAll(statement)) {
    const sub = entry.split('/').slice(1);
    if (sub.includes('private') || sub.some((part) => /^fesm|\.m?js$/.test(part))) {
      found.push(entry);
      continue;
    }
    for (const name of (names ?? '').split(',')) {
      const imported = name
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0];
      if (/^[_ɵ]/.test(imported)) found.push(`${entry}: ${imported}`);
    }
  }
  return found;
}
