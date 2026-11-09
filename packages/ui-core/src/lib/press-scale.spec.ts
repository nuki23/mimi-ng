/**
 * R.9: un solo efecto de clic. Los componentes usan los tokens del tema (`--mimi-press-scale` y
 * `--mimi-press-scale-sm`), que `prefers-reduced-motion` pone en 1. Un número suelto
 * (`active:scale-90`, `active:scale-[0.985]`) hundía cada elemento de una forma distinta e
 * ignoraba el movimiento reducido.
 *
 * Las pruebas corren en Node: se leen los archivos con fs (ver imports.spec.ts).
 */
interface PressDirent {
  name: string;
  isDirectory(): boolean;
}
const pressNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const pressFs = pressNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
  readdirSync(p: string, o: { withFileTypes: true }): PressDirent[];
};
const PRESS_ROOT = `${pressNode.cwd()}/packages/ui-core/src/lib`;

function pressFiles(dir: string): string[] {
  return pressFs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? pressFiles(`${dir}/${entry.name}`)
        : /\.(ts|html)$/.test(entry.name) && !/\.spec\.ts$/.test(entry.name)
          ? [`${dir}/${entry.name}`]
          : [],
    );
}

describe('efecto de clic uniforme (R.9)', () => {
  const sources = [
    ...pressFiles(`${PRESS_ROOT}/components`),
    ...pressFiles(`${PRESS_ROOT}/blocks`),
  ];

  it('ningún componente ni Block escribe un número en active:scale', () => {
    const offenders = sources.filter((file) =>
      /active:scale-(\[?\d|\d)/.test(
        pressFs.readFileSync(file, 'utf8').replace(/active:scale-100/g, ''),
      ),
    );
    expect(offenders.map((f) => f.slice(PRESS_ROOT.length + 1))).toEqual([]);
  });

  it('los dos tokens existen y el movimiento reducido los pone en 1', () => {
    const css = pressFs.readFileSync(`${PRESS_ROOT}/theme/theme-base.css`, 'utf8');
    expect(css).toMatch(/--mimi-press-scale:\s*0\.975;/);
    expect(css).toMatch(/--mimi-press-scale-sm:\s*0\.9;/);
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/--mimi-press-scale:\s*1;/);
    expect(reduced).toMatch(/--mimi-press-scale-sm:\s*1;/);
  });
});
