import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner, type UnitTestTree } from '@angular-devkit/schematics/testing';

/**
 * Ayudantes de las pruebas de schematics (no se compilan ni se publican). Corren contra dist/,
 * que es lo que se publica: `pnpm test:cli` compila antes.
 */

const here = dirname(fileURLToPath(import.meta.url));
export const COLLECTION = join(here, '..', '..', 'dist', 'collection.json');
export const UI_CORE_LIB = join(here, '..', '..', '..', 'ui-core', 'src', 'lib');

export interface Harness {
  runner: SchematicTestRunner;
  logs: { level: string; message: string }[];
  run(name: string, options?: Record<string, unknown>, tree?: UnitTestTree): Promise<UnitTestTree>;
  warnings(): string[];
}

export function harness(): Harness {
  const runner = new SchematicTestRunner('@mimi-ng/cli', COLLECTION);
  const logs: Harness['logs'] = [];
  runner.logger.subscribe((entry) => logs.push({ level: entry.level, message: entry.message }));
  return {
    runner,
    logs,
    run: (name, options = {}, tree) => runner.runSchematic(name, options, tree),
    warnings: () => logs.filter((l) => l.level === 'warn').map((l) => l.message),
  };
}

/** Workspace de Angular en memoria con aplicaciones que usan Tailwind 4 (style: 'tailwind'). */
export async function createWorkspace(
  runner: SchematicTestRunner,
  apps: string[] = ['app'],
): Promise<UnitTestTree> {
  let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '22.0.0',
  });
  for (const name of apps) {
    tree = await runner.runExternalSchematic(
      '@schematics/angular',
      'application',
      { name, style: 'tailwind', skipTests: true },
      tree,
    );
  }
  return tree;
}

export const snapshot = (tree: UnitTestTree) =>
  Object.fromEntries(tree.files.map((file) => [file, tree.readContent(file)]));

export const json = (tree: UnitTestTree, path: string) => JSON.parse(tree.readContent(path));

export const nodeTasks = (runner: SchematicTestRunner) =>
  runner.tasks.filter((task) => task.name === 'node-package').length;
