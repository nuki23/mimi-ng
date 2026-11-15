// Módulo (no script): sin esto, sus constantes chocan con las de otras pruebas del sitio.
export {};

/**
 * Sin rediseño (decidido por el usuario el 14/11/2026): el código es la fuente de verdad del
 * diseño y la tarea D6 está cerrada. Ni el sitio ni lo que copia la CLI presentan algo como
 * «provisional» o pendiente de la D6 (M.26). Las pruebas corren en Node (ver commands.spec.ts).
 */
const dsNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const dsFs = dsNode.getBuiltinModule('node:fs') as {
  readdirSync(p: string, o: { withFileTypes: true }): { name: string; isDirectory(): boolean }[];
  readFileSync(p: string, e: 'utf8'): string;
};
const ROOTS = ['apps/docs/src', 'packages/ui-core/src'].map((r) => `${dsNode.cwd()}/${r}`);

function sources(dir: string): string[] {
  return dsFs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sources(full);
    return /\.(ts|html|css)$/.test(entry.name) && !entry.name.endsWith('.spec.ts') ? [full] : [];
  });
}

describe('sin «provisional» ni D6 en el código (M.26)', () => {
  const files = ROOTS.flatMap(sources);

  it('encuentra los archivos', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it('ningún archivo presenta algo como provisional o pendiente de la D6', () => {
    const offenders = files.filter((file) =>
      /provisional|\bD6\b/i.test(dsFs.readFileSync(file, 'utf8')),
    );
    expect(offenders.map((f) => f.slice(dsNode.cwd().length + 1))).toEqual([]);
  });
});
