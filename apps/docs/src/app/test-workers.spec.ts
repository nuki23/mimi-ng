/**
 * Concurrencia de las pruebas (M.12, tanda 2 de la 0.7.0): las tres baterías usan
 * `vitest-base.config.mts`, que limita los workers a la mitad de los núcleos (mínimo 2) en vez de
 * subir los límites de tiempo. Se leen los archivos con fs, como en size-scale.spec.ts (nombres
 * propios: todas las pruebas se compilan juntas).
 */
const workersNode = (
  globalThis as unknown as {
    process: {
      cwd(): string;
      env: Record<string, string | undefined>;
      getBuiltinModule(id: string): unknown;
    };
  }
).process;
const workersFs = workersNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const workersOs = workersNode.getBuiltinModule('node:os') as { availableParallelism(): number };
const readRepo = (file: string) => workersFs.readFileSync(`${workersNode.cwd()}/${file}`, 'utf8');

describe('concurrencia de las pruebas (M.12)', () => {
  it('docs y ui-core usan vitest-base.config.mts', () => {
    const angular = JSON.parse(readRepo('angular.json')) as {
      projects: Record<string, { architect: { test: { options: { runnerConfig?: string } } } }>;
    };
    for (const project of ['docs', 'ui-core']) {
      expect(angular.projects[project].architect.test.options.runnerConfig, project).toBe(
        'vitest-base.config.mts',
      );
    }
  });

  it('la base limita maxWorkers y la CLI usa el mismo límite', () => {
    const base = readRepo('vitest-base.config.mts');
    expect(base).toContain('maxWorkers: mimiTestWorkers()');
    expect(base).toContain('availableParallelism() / 2');
    expect(base).toContain('MIMI_TEST_WORKERS');
    const cli = readRepo('packages/cli/vitest.config.mts');
    expect(cli).toContain("from '../../vitest-base.config.mts'");
    expect(cli).toContain('maxWorkers: mimiTestWorkers()');
  });

  it('este archivo corre en un worker dentro del límite', () => {
    const fromEnv = Number(workersNode.env['MIMI_TEST_WORKERS']);
    const limit =
      Number.isInteger(fromEnv) && fromEnv > 0
        ? fromEnv
        : Math.max(2, Math.floor(workersOs.availableParallelism() / 2));
    const pool = Number(workersNode.env['VITEST_POOL_ID'] ?? '1');
    expect(pool).toBeGreaterThanOrEqual(1);
    expect(pool).toBeLessThanOrEqual(limit);
  });
});
