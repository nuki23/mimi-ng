import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import cliPackage from '../package.json';
import { UI_CORE_LIB, createWorkspace, harness, json, snapshot } from './testing/harness';
import {
  TEST_BLOCK,
  TEST_BLOCK_FILES,
  TEST_BLOCK_SOURCE,
  collectionWithTestBlock,
} from './testing/test-block';

/**
 * Ítems de tipo `block` (B.1): `ng g mimi <block>` copia la pantalla a `aliases.blocks` de
 * mimi.json y sus componentes a la carpeta de siempre, con la misma regla de todo o nada.
 * Usan un Block de prueba que no está en el registro publicado (testing/test-block.ts).
 */

const APP = 'projects/app/src/app';
const UI = `${APP}/components/ui`;
const BLOCKS = `${APP}/blocks`;
const VERSION = cliPackage.version;
/** Una versión anterior cualquiera (distinta de la del paquete). */
const OLD = '0.1.1';
const BUTTON = ['button/button.ts', 'button/button.variants.ts', 'button/index.ts'];
const inProject = (file: string) => file.replace(/^blocks\//, `${BLOCKS}/`);
const oldContent = (file: string) => `// ${file} de la ${OLD}\n`;

let collection: string;
beforeAll(() => {
  collection = collectionWithTestBlock('blocks-spec');
});

async function initialized() {
  const h = harness(collection);
  const tree = await h.run('init', {}, await createWorkspace(h.runner));
  h.logs.length = 0;
  return { ...h, tree };
}

/**
 * Deja el Block (y, si se pide, Button) como si fueran de una versión anterior; `modified` son los archivos
 * que el usuario cambió sobre esa versión.
 */
function makeOld(
  tree: UnitTestTree,
  { block = true, button = false, modified = [] as string[] } = {},
) {
  const manifest = json(tree, '/.mimi/manifest.json');
  const config = json(tree, '/mimi.json');
  const files = [
    ...(block ? TEST_BLOCK_FILES.map((f) => ({ key: f, path: inProject(f) })) : []),
    ...(button ? BUTTON.map((f) => ({ key: f, path: `${UI}/${f}` })) : []),
  ];
  for (const { key, path } of files) {
    const old = oldContent(key);
    tree.overwrite(`/${path}`, modified.includes(key) ? `${old}// cambio propio\n` : old);
    tree.overwrite(`/.mimi/base/${key}`, old);
    manifest.files[key] = OLD;
  }
  if (block) config.blocks[TEST_BLOCK].version = OLD;
  if (button) config.components.button.version = OLD;
  tree.overwrite('/.mimi/manifest.json', JSON.stringify(manifest, null, 2));
  tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));
}

describe('ng g mimi <block> (B.1)', () => {
  it('copia el Block a src/app/blocks y sus componentes a components/ui, con sus bases', async () => {
    const { run, tree, logs, warnings } = await initialized();
    const result = await run('mimi', { components: [TEST_BLOCK] }, tree);

    for (const file of TEST_BLOCK_FILES) {
      expect(result.readContent(`/${inProject(file)}`), file).toBe(TEST_BLOCK_SOURCE[file]);
      // La base conserva blocks/, y es también la clave del manifiesto.
      expect(result.readContent(`/.mimi/base/${file}`), file).toBe(TEST_BLOCK_SOURCE[file]);
      expect(json(result, '/.mimi/manifest.json').files[file], file).toBe(VERSION);
    }
    expect(result.exists(`/${UI}/test-block/test-block.ts`)).toBe(false);
    expect(result.exists(`/${UI}/blocks/test-block/test-block.ts`)).toBe(false);
    expect(result.readContent(`/${UI}/button/button.ts`)).toBe(
      readFileSync(join(UI_CORE_LIB, 'components/button/button.ts'), 'utf8'),
    );

    const config = json(result, '/mimi.json');
    expect(config.blocks).toEqual({ [TEST_BLOCK]: { version: VERSION } });
    expect(config.components).toEqual({ button: { version: VERSION } });
    expect(config.aliases.blocks).toBe(BLOCKS);

    const messages = logs.map((l) => l.message);
    expect(messages).toContain(`  + ${BLOCKS}/test-block/test-block.ts`);
    expect(messages).toContain(
      "test-block es una pantalla: agrégala a tus rutas, por ejemplo { path: 'test', " +
        "component: TestBlock } (import { TestBlock } from './blocks/test-block').",
    );
    expect(warnings()).toEqual([]);
  });

  it('usa aliases.blocks de mimi.json', async () => {
    const { run, tree } = await initialized();
    const config = json(tree, '/mimi.json');
    config.aliases.blocks = 'projects/app/src/app/pages/';
    tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));
    const result = await run('mimi', { components: [TEST_BLOCK] }, tree);

    expect(result.exists(`/${APP}/pages/test-block/test-block.ts`)).toBe(true);
    expect(result.exists(`/${BLOCKS}/test-block/test-block.ts`)).toBe(false);
    // Se conserva lo que escribió el usuario.
    expect(json(result, '/mimi.json').aliases.blocks).toBe('projects/app/src/app/pages/');
  });

  it('proyecto de la 0.3.0 sin aliases.blocks: usa la carpeta por defecto y la escribe', async () => {
    const { run, tree } = await initialized();
    const config = json(tree, '/mimi.json');
    delete config.aliases.blocks;
    tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));

    // Un componente solo no la escribe: solo el primer Block.
    const withButton = await run('mimi', { components: ['button'] }, tree);
    expect(json(withButton, '/mimi.json').aliases.blocks).toBeUndefined();
    expect(json(withButton, '/mimi.json').blocks).toBeUndefined();

    const result = await run('mimi', { components: [TEST_BLOCK] }, withButton);
    expect(result.exists(`/${BLOCKS}/test-block/test-block.ts`)).toBe(true);
    expect(json(result, '/mimi.json').aliases.blocks).toBe(BLOCKS);
  });

  it('con otra carpeta de componentes, la de Blocks es su hermana', async () => {
    const { run, tree } = await initialized();
    const config = json(tree, '/mimi.json');
    delete config.aliases.blocks;
    config.aliases.components = 'projects/app/src/app/ui';
    tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));
    const result = await run('mimi', { components: [TEST_BLOCK] }, tree);
    expect(result.exists(`/${APP}/ui/button/button.ts`)).toBe(true);
    expect(result.exists(`/${BLOCKS}/test-block/test-block.ts`)).toBe(true);
  });

  it('es idempotente', async () => {
    const { run, tree, logs } = await initialized();
    const once = await run('mimi', { components: [TEST_BLOCK] }, tree);
    const before = snapshot(once);
    logs.length = 0;
    const twice = await run('mimi', { components: [TEST_BLOCK] }, once);
    expect(snapshot(twice)).toEqual(before);
    expect(logs.map((l) => l.message)).toContain('Nada que hacer: los archivos ya están al día.');
  });

  it('Block de una versión anterior sin cambios: se actualiza y lo dice', async () => {
    const { run, tree, logs } = await initialized();
    const installed = await run('mimi', { components: [TEST_BLOCK] }, tree);
    makeOld(installed);
    logs.length = 0;
    const result = await run('mimi', { components: [TEST_BLOCK] }, installed);
    for (const file of TEST_BLOCK_FILES) {
      expect(result.readContent(`/${inProject(file)}`), file).toBe(TEST_BLOCK_SOURCE[file]);
    }
    expect(logs.map((l) => l.message)).toContain(`test-block actualizado de ${OLD} a ${VERSION}`);
    expect(json(result, '/mimi.json').blocks[TEST_BLOCK].version).toBe(VERSION);
  });

  it('Block modificado sobre una versión anterior: no se toca ninguno de sus archivos, con su aviso', async () => {
    const { run, tree, warnings } = await initialized();
    const installed = await run('mimi', { components: [TEST_BLOCK] }, tree);
    makeOld(installed, { modified: ['blocks/test-block/test-block.ts'] });
    const result = await run('mimi', { components: [TEST_BLOCK] }, installed);

    expect(result.readContent(`/${BLOCKS}/test-block/test-block.ts`)).toBe(
      `${oldContent('blocks/test-block/test-block.ts')}// cambio propio\n`,
    );
    expect(result.readContent(`/${BLOCKS}/test-block/index.ts`)).toBe(
      oldContent('blocks/test-block/index.ts'),
    );
    expect(json(result, '/mimi.json').blocks[TEST_BLOCK].version).toBe(OLD);
    expect(warnings()).toEqual([
      `test-block no se actualizó a ${VERSION}: es tu pantalla y la modificaste ` +
        `(${BLOCKS}/test-block/test-block.ts), así que no se tocó ninguno de sus archivos. Es lo ` +
        'normal con un Block. La versión de Mimi que modificaste está en .mimi/base/blocks/test-block/, ' +
        'para comparar. Si quieres la nueva, guarda tus cambios (por ejemplo, en git) y vuelve ' +
        'a ejecutar el comando con --overwrite: reemplaza tu pantalla entera.',
    ]);
  });

  it('Block bloqueado: sus componentes sí se actualizan', async () => {
    const { run, tree, logs } = await initialized();
    const installed = await run('mimi', { components: [TEST_BLOCK] }, tree);
    makeOld(installed, { button: true, modified: ['blocks/test-block/index.ts'] });
    logs.length = 0;
    const result = await run('mimi', { components: [TEST_BLOCK] }, installed);

    expect(result.readContent(`/${UI}/button/button.ts`)).toBe(
      readFileSync(join(UI_CORE_LIB, 'components/button/button.ts'), 'utf8'),
    );
    expect(json(result, '/mimi.json').components.button.version).toBe(VERSION);
    expect(json(result, '/mimi.json').blocks[TEST_BLOCK].version).toBe(OLD);
    expect(logs.map((l) => l.message)).toContain(`button actualizado de ${OLD} a ${VERSION}`);
  });

  it('un componente del Block bloqueado bloquea el Block (no compilaría)', async () => {
    const { run, tree, warnings } = await initialized();
    const installed = await run('mimi', { components: [TEST_BLOCK] }, tree);
    makeOld(installed, { button: true, modified: ['button/button.ts'] });
    const result = await run('mimi', { components: [TEST_BLOCK] }, installed);

    for (const file of TEST_BLOCK_FILES) {
      expect(result.readContent(`/${inProject(file)}`), file).toBe(oldContent(file));
    }
    expect(json(result, '/mimi.json').blocks[TEST_BLOCK].version).toBe(OLD);
    expect(warnings()).toContain(
      `test-block no se actualizó a ${VERSION}: necesita button ${VERSION}, que no se ` +
        'actualizó (ver el aviso de button).',
    );
    expect(warnings()).toHaveLength(2);
  });

  it('--overwrite reemplaza el Block modificado y avisa que reemplazó la pantalla', async () => {
    const { run, tree, warnings } = await initialized();
    const installed = await run('mimi', { components: [TEST_BLOCK] }, tree);
    makeOld(installed, { modified: ['blocks/test-block/test-block.ts'] });
    const result = await run('mimi', { components: [TEST_BLOCK], overwrite: true }, installed);

    for (const file of TEST_BLOCK_FILES) {
      expect(result.readContent(`/${inProject(file)}`), file).toBe(TEST_BLOCK_SOURCE[file]);
      expect(result.readContent(`/.mimi/base/${file}`), file).toBe(TEST_BLOCK_SOURCE[file]);
    }
    expect(json(result, '/mimi.json').blocks[TEST_BLOCK].version).toBe(VERSION);
    expect(warnings()).toEqual([
      `--overwrite reemplazó tu pantalla test-block (${BLOCKS}/test-block/) por la de Mimi ` +
        `${VERSION}. Si tenías cambios, recupéralos de git.`,
    ]);
  });

  describe('G1: con source(none), el @source de la carpeta de Blocks', () => {
    const CSS = '/projects/app/src/styles.css';
    /** Un proyecto de la 0.3.0 con source(none): init escribió solo el @source de componentes. */
    async function withSourceNone() {
      const h = harness(collection);
      let tree = await createWorkspace(h.runner);
      tree.overwrite(CSS, "@import 'tailwindcss' source(none);\n");
      tree = await h.run('init', {}, tree);
      const css = tree
        .readContent(CSS)
        .split('\n')
        .filter((l) => !l.includes('/blocks'))
        .join('\n');
      tree.overwrite(CSS, css);
      h.logs.length = 0;
      return { ...h, tree };
    }

    it('ng g mimi <block> lo agrega después del de componentes, una vez, y lo dice', async () => {
      const { run, tree, logs } = await withSourceNone();
      expect(tree.readContent(CSS)).not.toContain('./app/blocks');
      const result = await run('mimi', { components: [TEST_BLOCK] }, tree);
      expect(result.readContent(CSS)).toBe(
        "@import 'tailwindcss' source(none);\n" +
          '@import "./app/components/ui/theme/theme-base.css";\n' +
          '@source "./app/components/ui";\n' +
          '@source "./app/blocks";\n',
      );
      expect(logs.map((l) => l.message).join('\n')).toContain('  @source "./app/blocks";');
      const again = await run('mimi', { components: [TEST_BLOCK] }, result);
      expect(again.readContent(CSS)).toBe(result.readContent(CSS));
    });

    it('con aliases.blocks propio, su carpeta; con comillas simples ya escrito, no lo repite', async () => {
      const { run, tree } = await withSourceNone();
      const config = json(tree, '/mimi.json');
      config.aliases.blocks = 'projects/app/src/app/pages';
      tree.overwrite('/mimi.json', JSON.stringify(config));
      const result = await run('mimi', { components: [TEST_BLOCK] }, tree);
      expect(result.readContent(CSS)).toContain('@source "./app/pages";');

      const manual = await withSourceNone();
      manual.tree.overwrite(CSS, `${manual.tree.readContent(CSS)}@source './app/blocks';\n`);
      const kept = await manual.run('mimi', { components: [TEST_BLOCK] }, manual.tree);
      expect(kept.readContent(CSS).match(/app\/blocks/g)).toHaveLength(1);
    });

    it('un componente solo no lo agrega; sin source(none) tampoco', async () => {
      const { run, tree } = await withSourceNone();
      const withButton = await run('mimi', { components: ['button'] }, tree);
      expect(withButton.readContent(CSS)).not.toContain('./app/blocks');

      const plain = await initialized();
      const result = await plain.run('mimi', { components: [TEST_BLOCK] }, plain.tree);
      expect(result.readContent(CSS)).not.toContain('@source "./app/blocks"');
    });
  });

  it('el nombre del Block se sugiere como los componentes', async () => {
    const { run, tree } = await initialized();
    await expect(run('mimi', { components: ['test-blok'] }, tree)).rejects.toThrow(
      '¿Quisiste decir test-block?',
    );
  });
});
