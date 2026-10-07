import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UnitTestTree } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import cliPackage from '../package.json';
import {
  UI_CORE_LIB,
  createWorkspace,
  harness,
  json,
  nodeTasks,
  snapshot,
} from './testing/harness';

/** Pruebas de ui con SchematicTestRunner, sobre un workspace en memoria ya inicializado. */

const UI = 'projects/app/src/app/components/ui';
/** La versión de Mimi es la del package.json de la CLI (la que el build escribe en el registro). */
const registry = { version: cliPackage.version };
const template = (file: string) => readFileSync(join(UI_CORE_LIB, file), 'utf8');

async function initialized() {
  const h = harness();
  const tree = await h.run('init', {}, await createWorkspace(h.runner));
  h.logs.length = 0;
  return { ...h, tree };
}

const filesUnder = (tree: UnitTestTree, dir: string) =>
  tree.files
    .filter((f) => f.startsWith(`/${dir}/`))
    .map((f) => f.slice(dir.length + 2))
    .sort();

describe('mimi (alias ui)', () => {
  it('agrega un componente con sus registryDependencies, idéntico a ui-core, y su base', async () => {
    const { run, tree } = await initialized();
    const result = await run('mimi', { components: ['button'] }, tree);

    for (const file of [
      'components/button/button.ts',
      'components/button/button.variants.ts',
      'components/button/index.ts',
    ]) {
      // En el proyecto, los componentes van sin "components/": @/components/ui/button.
      expect(result.readContent(`/${UI}/${file.replace('components/', '')}`), file).toBe(
        template(file),
      );
      // Copia original en .mimi/base, sin "components/".
      expect(result.readContent(`/.mimi/base/${file.replace('components/', '')}`), file).toBe(
        template(file),
      );
    }
    expect(result.exists(`/${UI}/components`)).toBe(false);
    // Button no arrastra field-state (ni @angular/forms).
    expect(result.exists(`/${UI}/utils/field-state.ts`)).toBe(false);
    expect(json(result, '/mimi.json').components).toEqual({
      button: { version: registry.version },
    });
  });

  it('varios a la vez, con dependencias transitivas y sin duplicados', async () => {
    const { run, tree, logs } = await initialized();
    const result = await run(
      'mimi',
      { components: ['input', 'form-field', 'button', 'input'] },
      tree,
    );

    expect(filesUnder(result, UI)).toEqual(
      [
        'button/button.ts',
        'button/button.variants.ts',
        'button/index.ts',
        'form-field/error-messages.ts',
        'form-field/form-error.ts',
        'form-field/form-field.ts',
        'form-field/index.ts',
        'input/index.ts',
        'input/input.ts',
        'input/input.variants.ts',
        'theme/index.ts',
        'theme/provider.ts',
        'theme/theme-base.css',
        'theme/types.ts',
        'utils/cn.ts',
        'utils/control-styles.ts',
        'utils/field-state.ts',
      ].sort(),
    );
    expect(result.readContent(`/${UI}/utils/field-state.ts`)).toBe(
      template('utils/field-state.ts'),
    );
    expect(Object.keys(json(result, '/mimi.json').components).sort()).toEqual([
      'button',
      'form-field',
      'input',
    ]);
    // Cada archivo se informa una sola vez.
    const added = logs.filter((l) => l.message.startsWith('  + ')).map((l) => l.message);
    expect(added.length).toBe(new Set(added).size);
  });

  it('con "style": "vivid" (mimi.json de la 0.1.0) funciona igual y conserva el valor', async () => {
    const { run, tree, warnings } = await initialized();
    const config = json(tree, '/mimi.json');
    tree.overwrite('/mimi.json', `${JSON.stringify({ ...config, style: 'vivid' }, null, 2)}\n`);
    const result = await run('mimi', { components: ['button'] }, tree);
    expect(result.readContent(`/${UI}/button/button.ts`)).toBe(
      template('components/button/button.ts'),
    );
    expect(json(result, '/mimi.json').style).toBe('vivid');
    expect(json(result, '/mimi.json').components.button).toEqual({ version: registry.version });
    expect(warnings()).toEqual([]);
  });

  it('el alias ui ejecuta el mismo schematic (ng g ui y ng g @mimi-ng/cli:ui)', async () => {
    const { run, tree } = await initialized();
    const viaAlias = await run('ui', { components: ['badge'] }, tree);
    const { run: runAgain, tree: fresh } = await initialized();
    const viaName = await runAgain('mimi', { components: ['badge'] }, fresh);
    expect(snapshot(viaAlias)).toEqual(snapshot(viaName));
  });

  it('vuelve a copiar un archivo de init que el usuario borró', async () => {
    const { run, tree } = await initialized();
    tree.delete(`/${UI}/utils/cn.ts`);
    const result = await run('mimi', { components: ['card'] }, tree);
    expect(result.readContent(`/${UI}/utils/cn.ts`)).toBe(template('utils/cn.ts'));
  });

  it('sin mimi.json falla pidiendo ng add, sin cambios', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    const before = snapshot(tree);
    await expect(run('mimi', { components: ['button'] }, tree)).rejects.toThrow(
      'Mimi no está configurado en este proyecto (falta mimi.json). Ejecuta primero:\n  ng add @mimi-ng/cli',
    );
    expect(snapshot(tree)).toEqual(before);
  });

  it('nombre desconocido: lista los disponibles y sugiere el parecido', async () => {
    const { run, tree } = await initialized();
    const before = snapshot(tree);
    const error = run('mimi', { components: ['buton', 'zzz'] }, tree);
    await expect(error).rejects.toThrow(
      '"buton" no es un componente de Mimi. ¿Quisiste decir button?',
    );
    await expect(run('mimi', { components: ['zzz'] }, tree)).rejects.toThrow(
      /"zzz" no es un componente de Mimi\.\nDisponibles: avatar, badge, button, card/,
    );
    await expect(run('mimi', { components: ['form'] }, tree)).rejects.toThrow(
      '¿Quisiste decir form-field?',
    );
    expect(snapshot(tree)).toEqual(before);
  });

  it('sin nombres (y sin terminal para preguntar) explica cómo usarlo', async () => {
    const { run, tree } = await initialized();
    await expect(run('mimi', {}, tree)).rejects.toThrow(
      'Indica qué componentes agregar, por ejemplo: ng g mimi button',
    );
  });

  it('archivo modificado: se omite con aviso y no cambia su base ni su versión', async () => {
    const { run, tree, warnings } = await initialized();
    const first = await run('mimi', { components: ['badge'] }, tree);
    const file = `/${UI}/badge/badge.ts`;
    first.overwrite(file, '// mi versión\n');
    // La base de una versión anterior de Mimi: debe quedar tal cual.
    first.overwrite('/.mimi/base/badge/badge.ts', '// base de la 0.0.9\n');
    const config = json(first, '/mimi.json');
    config.components.badge.version = '0.0.9';
    first.overwrite('/mimi.json', JSON.stringify(config, null, 2));

    const second = await run('mimi', { components: ['badge'] }, first);
    expect(second.readContent(file)).toBe('// mi versión\n');
    expect(second.readContent('/.mimi/base/badge/badge.ts')).toBe('// base de la 0.0.9\n');
    expect(json(second, '/mimi.json').components.badge.version).toBe('0.0.9');
    expect(warnings()).toContain(
      `Omitido: ${UI}/badge/badge.ts ya existe con otro contenido (usa --overwrite para reemplazarlo).`,
    );
  });

  it('--overwrite reemplaza el archivo y actualiza su base y su versión', async () => {
    const { run, tree } = await initialized();
    const first = await run('mimi', { components: ['badge'] }, tree);
    const file = `/${UI}/badge/badge.ts`;
    first.overwrite(file, '// mi versión\n');
    first.overwrite('/.mimi/base/badge/badge.ts', '// base vieja\n');
    const config = json(first, '/mimi.json');
    config.components.badge.version = '0.0.9';
    first.overwrite('/mimi.json', JSON.stringify(config, null, 2));

    const result = await run('mimi', { components: ['badge'], overwrite: true }, first);
    expect(result.readContent(file)).toBe(template('components/badge/badge.ts'));
    expect(result.readContent('/.mimi/base/badge/badge.ts')).toBe(
      template('components/badge/badge.ts'),
    );
    expect(json(result, '/mimi.json').components.badge.version).toBe(registry.version);
  });

  it('es idempotente: ui button dos veces no cambia nada ni reinstala', async () => {
    const { runner, run, tree, logs } = await initialized();
    const first = await run('mimi', { components: ['button'] }, tree);
    const after = snapshot(first);
    const second = await run('mimi', { components: ['button'] }, first);
    expect(snapshot(second)).toEqual(after);
    expect(nodeTasks(runner)).toBe(0);
    expect(logs.map((l) => l.message)).toContain('Nada que hacer: los archivos ya están al día.');
  });

  it('dependencias de npm con la versión del registro, instaladas una sola vez', async () => {
    const { runner, run, tree } = await initialized();
    const pkg = json(tree, '/package.json');
    delete pkg.dependencies['class-variance-authority'];
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));

    const result = await run('mimi', { components: ['button'] }, tree);
    expect(json(result, '/package.json').dependencies['class-variance-authority']).toBe('^0.7.1');
    expect(nodeTasks(runner)).toBe(1);
  });

  it('peerDependencies: @angular/forms solo si falta, con el rango de @angular/core', async () => {
    // El proyecto generado ya trae @angular/forms: no se toca.
    const { run, tree } = await initialized();
    const withForms = json(tree, '/package.json').dependencies['@angular/forms'];
    const kept = await run('mimi', { components: ['switch'] }, tree);
    expect(json(kept, '/package.json').dependencies['@angular/forms']).toBe(withForms);

    // Sin @angular/forms: se agrega con el rango de @angular/core.
    const h = await initialized();
    const pkg = json(h.tree, '/package.json');
    delete pkg.dependencies['@angular/forms'];
    h.tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    const added = await h.run('mimi', { components: ['switch'] }, h.tree);
    const deps = json(added, '/package.json').dependencies;
    expect(deps['@angular/forms']).toBe(deps['@angular/core']);
    expect(h.logs.map((l) => l.message)).toContain(`  @angular/forms@${deps['@angular/core']}`);
  });

  it('popover: @angular/cdk con el rango de @angular/core, solo si falta', async () => {
    const { run, tree, logs } = await initialized();
    expect(json(tree, '/package.json').dependencies['@angular/cdk']).toBeUndefined();
    const result = await run('mimi', { components: ['popover'] }, tree);
    const deps = json(result, '/package.json').dependencies;
    expect(deps['@angular/cdk']).toBe(deps['@angular/core']);
    expect(logs.map((l) => l.message)).toContain(`  @angular/cdk@${deps['@angular/core']}`);
    expect(result.exists(`/${UI}/popover/popover.ts`)).toBe(true);
  });

  it('popover: agrega el @import de overlay-prebuilt.css una sola vez, después del tema', async () => {
    const { run, tree, logs } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    const first = await run('mimi', { components: ['popover'] }, tree);
    const css = first.readContent(`/${cssPath}`);
    const lines = css.split(/\r?\n/);
    const theme = lines.findIndex((l) => l.includes('theme-base.css'));
    expect(lines[theme + 1]).toBe('@import "@angular/cdk/overlay-prebuilt.css";');
    expect(logs.map((l) => l.message)).toContain(`Agregado a ${cssPath}:`);

    // Otra vez (y con otro ítem): no se duplica.
    const second = await run('mimi', { components: ['popover', 'button'] }, first);
    const again = second.readContent(`/${cssPath}`);
    expect(again.match(/overlay-prebuilt\.css/g)).toHaveLength(1);
  });

  it('popover: respeta un @import que ya estaba (con comillas simples)', async () => {
    const { run, tree } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    const original = `${tree.readContent(`/${cssPath}`)}\n@import '@angular/cdk/overlay-prebuilt.css';\n`;
    tree.overwrite(`/${cssPath}`, original);
    const result = await run('mimi', { components: ['popover'] }, tree);
    expect(result.readContent(`/${cssPath}`)).toBe(original);
  });

  it('popover: sin el tema en el CSS, va después del @import de Tailwind', async () => {
    const { run, tree } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    tree.overwrite(`/${cssPath}`, '@import "tailwindcss";\n\n.mia { color: red; }\n');
    const result = await run('mimi', { components: ['popover'] }, tree);
    expect(result.readContent(`/${cssPath}`)).toBe(
      '@import "tailwindcss";\n@import "@angular/cdk/overlay-prebuilt.css";\n\n.mia { color: red; }\n',
    );
  });

  it('popover: si no encuentra el CSS global, explica qué agregar a mano', async () => {
    const { run, tree, warnings } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    tree.delete(`/${cssPath}`);
    await run('mimi', { components: ['popover'] }, tree);
    expect(warnings().join('\n')).toContain('@import "@angular/cdk/overlay-prebuilt.css";');
  });

  it('tooltip: copia utils/overlay, instala @angular/cdk y agrega el @import una vez', async () => {
    const { run, tree } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    const result = await run('mimi', { components: ['tooltip', 'popover'] }, tree);
    expect(result.exists(`/${UI}/tooltip/tooltip.ts`)).toBe(true);
    expect(result.readContent(`/${UI}/utils/overlay.ts`)).toBe(template('utils/overlay.ts'));
    const deps = json(result, '/package.json').dependencies;
    expect(deps['@angular/cdk']).toBe(deps['@angular/core']);
    expect(result.readContent(`/${cssPath}`).match(/overlay-prebuilt\.css/g)).toHaveLength(1);
  });

  it('los componentes sin cssImports no tocan el CSS global', async () => {
    const { run, tree } = await initialized();
    const cssPath = json(tree, '/mimi.json').tailwind.css as string;
    const before = tree.readContent(`/${cssPath}`);
    const result = await run('mimi', { components: ['button', 'switch'] }, tree);
    expect(result.readContent(`/${cssPath}`)).toBe(before);
  });

  it('el mensaje final recuerda guardar .mimi/ en git', async () => {
    const { run, tree, logs } = await initialized();
    await run('mimi', { components: ['card'] }, tree);
    expect(logs.map((l) => l.message)).toContain(
      'Guarda la carpeta .mimi/ en git: Mimi la usa para actualizar tus componentes sin perder tus cambios.',
    );
  });

  it('usa la carpeta de mimi.json', async () => {
    const h = harness();
    const workspace = await createWorkspace(h.runner);
    workspace.create(
      '/mimi.json',
      JSON.stringify({ aliases: { components: 'projects/app/src/shared/ui' }, components: {} }),
    );
    const tree = await h.run('init', {}, workspace);
    const result = await h.run('mimi', { components: ['skeleton'] }, tree);
    expect(result.exists('/projects/app/src/shared/ui/skeleton/skeleton.ts')).toBe(true);
  });
});

/**
 * La CLI de Angular pasa el Prettier del proyecto por lo que escriben los schematics: el archivo
 * y su base quedan con el mismo formato, distinto de la plantilla. Se simula reformateando los
 * dos igual (comillas dobles).
 */
const prettierLike = (content: string) => content.replace(/'/g, '"');
const BUTTON = ['button.ts', 'button.variants.ts', 'index.ts'];

async function withButtonFormatted() {
  const h = await initialized();
  const tree = await h.run('mimi', { components: ['button'] }, h.tree);
  for (const name of BUTTON) {
    const formatted = prettierLike(tree.readContent(`/${UI}/button/${name}`));
    tree.overwrite(`/${UI}/button/${name}`, formatted);
    tree.overwrite(`/.mimi/base/button/${name}`, formatted);
  }
  h.logs.length = 0;
  return { ...h, tree };
}

describe('ui: modificados según .mimi/base (no según la plantilla)', () => {
  it('guarda en .mimi/manifest.json la versión de cada base', async () => {
    const { run, tree } = await initialized();
    const result = await run('mimi', { components: ['button'] }, tree);
    const manifest = json(result, '/.mimi/manifest.json').files;
    for (const name of BUTTON) expect(manifest[`button/${name}`]).toBe(registry.version);
    expect(manifest['utils/cn.ts']).toBe(registry.version);
  });

  it('formateado por Prettier y de la misma versión: no lo toca ni avisa', async () => {
    const { run, tree, warnings, logs } = await withButtonFormatted();
    const before = snapshot(tree);
    const result = await run('mimi', { components: ['button'] }, tree);
    expect(snapshot(result)).toEqual(before);
    expect(warnings()).toEqual([]);
    expect(logs.map((l) => l.message)).toContain('Nada que hacer: los archivos ya están al día.');
  });

  it('igual a su base pero de una versión anterior: lo actualiza y lo dice', async () => {
    const { run, tree, warnings, logs } = await withButtonFormatted();
    const manifest = json(tree, '/.mimi/manifest.json');
    for (const name of BUTTON) manifest.files[`button/${name}`] = '0.0.9';
    tree.overwrite('/.mimi/manifest.json', JSON.stringify(manifest, null, 2));
    const config = json(tree, '/mimi.json');
    config.components.button.version = '0.0.9';
    tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));

    const result = await run('mimi', { components: ['button'] }, tree);
    for (const name of BUTTON) {
      expect(result.readContent(`/${UI}/button/${name}`)).toBe(
        template(`components/button/${name}`),
      );
      expect(result.readContent(`/.mimi/base/button/${name}`)).toBe(
        template(`components/button/${name}`),
      );
      expect(json(result, '/.mimi/manifest.json').files[`button/${name}`]).toBe(registry.version);
    }
    expect(json(result, '/mimi.json').components.button.version).toBe(registry.version);
    expect(logs.map((l) => l.message)).toContain(
      `button actualizado de 0.0.9 a ${registry.version}`,
    );
    expect(warnings()).toEqual([]);
  });

  it('distinto de su base (cambio del usuario sobre el formateado): se omite', async () => {
    const { run, tree, warnings } = await withButtonFormatted();
    const file = `/${UI}/button/button.ts`;
    tree.overwrite(file, `${tree.readContent(file)}// cambio propio\n`);
    const result = await run('mimi', { components: ['button'] }, tree);
    expect(result.readContent(file)).toContain('// cambio propio');
    expect(warnings()).toEqual([
      `Omitido: ${UI}/button/button.ts ya existe con otro contenido (usa --overwrite para reemplazarlo).`,
    ]);
  });

  it('sin base (archivo del usuario que ya estaba): se omite', async () => {
    const { run, tree, warnings } = await initialized();
    tree.create(`/${UI}/badge/badge.ts`, '// badge propio\n');
    const result = await run('mimi', { components: ['badge'] }, tree);
    expect(result.readContent(`/${UI}/badge/badge.ts`)).toBe('// badge propio\n');
    expect(result.exists('/.mimi/base/badge/badge.ts')).toBe(false);
    expect(warnings()).toHaveLength(1);
  });
});
