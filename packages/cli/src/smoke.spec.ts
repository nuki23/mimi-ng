import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner, type UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Pruebas de schematics con SchematicTestRunner sobre un workspace de Angular creado en
 * memoria con @schematics/angular. Corren contra dist/ (lo que se publica): antes hay que
 * compilar (`pnpm test:cli` lo hace).
 */

const here = dirname(fileURLToPath(import.meta.url));
const collection = join(here, '..', 'dist', 'collection.json');
const uiCoreLib = join(here, '..', '..', 'ui-core', 'src', 'lib');
const runner = new SchematicTestRunner('@mimi-ng/cli', collection);

async function createWorkspace(): Promise<UnitTestTree> {
  const workspace = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '22.0.0',
  });
  return runner.runExternalSchematic(
    '@schematics/angular',
    'application',
    { name: 'app', standalone: true, skipTests: true },
    workspace,
  );
}

describe('schematic smoke', () => {
  let appTree: UnitTestTree;

  beforeAll(async () => {
    appTree = await createWorkspace();
  });

  it('el workspace de prueba es un proyecto Angular real', () => {
    expect(appTree.exists('/angular.json')).toBe(true);
    expect(appTree.exists('/projects/app/src/main.ts')).toBe(true);
  });

  it('copia el ítem y sus registryDependencies, idénticos a ui-core, desde las plantillas del paquete', async () => {
    const tree = await runner.runSchematic(
      'smoke',
      { item: 'button', path: 'projects/app/src/app/components/ui' },
      appTree,
    );
    const base = '/projects/app/src/app/components/ui';
    const expected = [
      'utils/cn.ts',
      'utils/control-styles.ts',
      'components/button/button.ts',
      'components/button/button.variants.ts',
      'components/button/index.ts',
    ];
    for (const file of expected) {
      expect(tree.readContent(`${base}/${file}`), file).toBe(
        readFileSync(join(uiCoreLib, file), 'utf8'),
      );
    }
    // Nada más: ni otros componentes ni field-state (Button no arrastra @angular/forms).
    const copied = tree.files.filter((f) => f.startsWith(base));
    expect(copied.sort()).toEqual(expected.map((f) => `${base}/${f}`).sort());
  });

  it('también entrega el tema con theme-base.css', async () => {
    const tree = await runner.runSchematic('smoke', { item: 'theme', path: 'mimi' }, appTree);
    expect(tree.readContent('/mimi/theme/theme-base.css')).toContain('--mimi-primary');
  });

  it('falla con un nombre que no está en el registro', async () => {
    await expect(runner.runSchematic('smoke', { item: 'nope' }, appTree)).rejects.toThrow(
      '"nope" no existe en el registro de Mimi',
    );
  });

  // Tarea 3.3
  it.todo(
    'reescribe las importaciones "@/components/ui/<x>" según la ruta o el alias configurado en el proyecto del usuario (si no, el código copiado no compila)',
  );
  it.todo(
    'decide qué hacer si el archivo ya existe con otro contenido (hoy falla con "A merge conflicted on path"; si es idéntico, no pasa nada): omitir, sobrescribir con --overwrite o avisar',
  );
});
