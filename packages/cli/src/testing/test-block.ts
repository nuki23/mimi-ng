import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Un Block de prueba mínimo (B.1) que **no** va en el registro publicado: se arma una copia de
 * dist/ con el Block agregado a las plantillas y al registro. La copia va dentro de
 * node_modules/ de la CLI, para que el código compilado encuentre sus dependencias
 * (@angular-devkit/schematics) y para que git y Prettier la ignoren.
 */

const here = dirname(fileURLToPath(import.meta.url));
const DIST = join(here, '..', '..', 'dist');

export const TEST_BLOCK = 'test-block';
export const TEST_BLOCK_FILES = ['blocks/test-block/test-block.ts', 'blocks/test-block/index.ts'];

export const TEST_BLOCK_SOURCE: Record<string, string> = {
  'blocks/test-block/test-block.ts': [
    "import { ChangeDetectionStrategy, Component } from '@angular/core';",
    "import { MimiButton } from '@/components/ui/button';",
    '',
    '@Component({',
    "  selector: 'mimi-test-block',",
    '  imports: [MimiButton],',
    '  template: `<button mimiBtn type="button">Hola</button>`,',
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    '})',
    'export class TestBlock {}',
    '',
  ].join('\n'),
  'blocks/test-block/index.ts': "export * from './test-block';\n",
};

/**
 * Un Block de prueba de tipo página (B.11), con la forma de los reales: clase `Demo01`, un tipo
 * `Demo01Value`, selector e `id` con `mimi-demo-01` y su plantilla en `./demo-01.html`.
 */
export const TEST_PAGE = 'demo-01';
export const TEST_PAGE_FILES = [
  'blocks/demo-01/demo-01.ts',
  'blocks/demo-01/demo-01.html',
  'blocks/demo-01/index.ts',
];

export const TEST_PAGE_SOURCE: Record<string, string> = {
  'blocks/demo-01/demo-01.ts': [
    "import { ChangeDetectionStrategy, Component, output } from '@angular/core';",
    "import { MimiButton } from '@/components/ui/button';",
    '',
    'export interface Demo01Value {',
    '  ok: boolean;',
    '}',
    '',
    '/** demo-01: `<mimi-demo-01 (done)="…" />`. */',
    '@Component({',
    "  selector: 'mimi-demo-01',",
    '  imports: [MimiButton],',
    "  templateUrl: './demo-01.html',",
    '  changeDetection: ChangeDetectionStrategy.OnPush,',
    '})',
    'export class Demo01 {',
    '  readonly done = output<Demo01Value>();',
    '  protected readonly id = `mimi-demo-01-${0}`;',
    '}',
    '',
  ].join('\n'),
  'blocks/demo-01/demo-01.html':
    '<button mimiBtn type="button" [id]="id" (click)="done.emit({ ok: true })">Hola</button>\n',
  'blocks/demo-01/index.ts': "export * from './demo-01';\n",
};

/** Copia dist/ con los Blocks de prueba y devuelve la ruta de su collection.json. */
export function collectionWithTestBlock(name = 'default'): string {
  const target = join(here, '..', '..', 'node_modules', '.mimi-test-dist', name);
  rmSync(target, { recursive: true, force: true });
  cpSync(DIST, target, { recursive: true });
  for (const [file, content] of Object.entries(TEST_BLOCK_SOURCE)) {
    const path = join(target, 'templates', file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  const registryPath = join(target, 'registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  registry.items[TEST_BLOCK] = {
    type: 'block',
    kind: 'section',
    files: TEST_BLOCK_FILES,
    registryDependencies: ['button'],
  };
  for (const [file, content] of Object.entries(TEST_PAGE_SOURCE)) {
    const path = join(target, 'templates', file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }
  registry.items[TEST_PAGE] = {
    type: 'block',
    kind: 'page',
    files: TEST_PAGE_FILES,
    registryDependencies: ['button'],
  };
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  return join(target, 'collection.json');
}
