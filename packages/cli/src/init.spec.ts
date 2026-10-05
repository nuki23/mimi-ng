import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner, type UnitTestTree } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import registryJson from './registry.json';

/**
 * Pruebas de init y ng-add con SchematicTestRunner, sobre workspaces creados en memoria con
 * @schematics/angular (aplicaciones con style: 'tailwind': Tailwind 4 real). Corren contra dist/.
 */

const here = dirname(fileURLToPath(import.meta.url));
const collection = join(here, '..', 'dist', 'collection.json');
const uiCoreLib = join(here, '..', '..', 'ui-core', 'src', 'lib');
const registry = registryJson as {
  suggestedDependencies: Record<string, string>;
  items: Record<string, { dependencies?: Record<string, string> }>;
};

const UI = 'projects/app/src/app/components/ui';
const STYLES = '/projects/app/src/styles.css';
const BASE_FILES = [
  'theme/theme-base.css',
  'theme/types.ts',
  'theme/provider.ts',
  'theme/index.ts',
  'utils/cn.ts',
  'utils/control-styles.ts',
];

interface Harness {
  runner: SchematicTestRunner;
  logs: { level: string; message: string }[];
  run(options?: Record<string, unknown>, tree?: UnitTestTree, name?: string): Promise<UnitTestTree>;
}

function harness(): Harness {
  const runner = new SchematicTestRunner('@mimi-ng/cli', collection);
  const logs: Harness['logs'] = [];
  runner.logger.subscribe((entry) => logs.push({ level: entry.level, message: entry.message }));
  return {
    runner,
    logs,
    run: (options = {}, tree, name = 'init') => runner.runSchematic(name, options, tree),
  };
}

async function createWorkspace(
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

const snapshot = (tree: UnitTestTree) =>
  Object.fromEntries(tree.files.map((file) => [file, tree.readContent(file)]));

const json = (tree: UnitTestTree, path: string) => JSON.parse(tree.readContent(path));

const version = (name: string) =>
  Object.values(registry.items).find((item) => item.dependencies?.[name])!.dependencies![name];

const nodeTasks = (runner: SchematicTestRunner) =>
  runner.tasks.filter((task) => task.name === 'node-package').length;

describe('init', () => {
  it('proyecto limpio: archivos, CSS, alias, dependencias y mimi.json', async () => {
    const { runner, run } = harness();
    const workspace = await createWorkspace(runner);
    const tree = await run({}, workspace);

    // Tema y utilidades, idénticos a ui-core. Sin field-state ni índice de utils.
    for (const file of BASE_FILES) {
      expect(tree.readContent(`/${UI}/${file}`), file).toBe(
        readFileSync(join(uiCoreLib, file), 'utf8'),
      );
    }
    expect(tree.exists(`/${UI}/utils/field-state.ts`)).toBe(false);
    expect(tree.exists(`/${UI}/utils/index.ts`)).toBe(false);

    // El tema se importa justo después de Tailwind, sin @source.
    const css = tree.readContent(STYLES);
    expect(css).toMatch(
      /@import 'tailwindcss';\r?\n@import "\.\/app\/components\/ui\/theme\/theme-base\.css";/,
    );
    expect(css).not.toContain('@source');

    // Alias en tsconfig.json, conservando los comentarios de Angular.
    const tsconfig = tree.readContent('/tsconfig.json');
    expect(tsconfig.startsWith('/* To learn more about Typescript configuration file')).toBe(true);
    expect(tsconfig).toContain('"@/components/ui/*": [');
    expect(tsconfig).toContain(`"./${UI}/*"`);

    // Dependencias con las versiones del registro; sin íconos por defecto.
    const pkg = json(tree, '/package.json');
    for (const name of ['clsx', 'tailwind-merge', 'class-variance-authority']) {
      expect(pkg.dependencies[name], name).toBe(version(name));
    }
    expect(pkg.dependencies['@lucide/angular']).toBeUndefined();
    // Una sola instalación agendada (runner.tasks guarda las de la última ejecución).
    expect(nodeTasks(runner)).toBe(1);

    expect(json(tree, '/mimi.json')).toEqual({
      style: 'mimi',
      tailwind: { css: 'projects/app/src/styles.css' },
      aliases: {
        components: UI,
        utils: `${UI}/utils`,
        theme: 'projects/app/src/app/mimi.preset.ts',
      },
      components: {},
    });
  });

  it('muestra los siguientes pasos', async () => {
    const { runner, run, logs } = harness();
    await run({}, await createWorkspace(runner));
    const text = logs.map((l) => l.message).join('\n');
    expect(text).toContain('Agrega tu primer componente:');
    expect(text).toContain('ng g mimi button');
    expect(text).toContain('Guarda la carpeta .mimi/ en git');
  });

  it('es idempotente: dos ejecuciones dan el mismo resultado y no reinstalan', async () => {
    const { runner, run, logs } = harness();
    const first = await run({}, await createWorkspace(runner));
    const afterFirst = snapshot(first);
    expect(nodeTasks(runner)).toBe(1);
    const second = await run({}, first);
    expect(snapshot(second)).toEqual(afterFirst);
    expect(nodeTasks(runner)).toBe(0);
    expect(logs.filter((l) => l.level === 'warn')).toEqual([]);
  });

  it('busca el CSS global en angular.json (otra ruta)', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    const angular = json(tree, '/angular.json');
    angular.projects.app.architect.build.options.styles = ['projects/app/src/global/app.css'];
    tree.overwrite('/angular.json', JSON.stringify(angular, null, 2));
    tree.create('/projects/app/src/global/app.css', '@import "tailwindcss";\n');

    const result = await run({}, tree);
    expect(result.readContent('/projects/app/src/global/app.css')).toBe(
      '@import "tailwindcss";\n@import "../app/components/ui/theme/theme-base.css";\n',
    );
    expect(json(result, '/mimi.json').tailwind.css).toBe('projects/app/src/global/app.css');
  });

  it('con dos proyectos pide --project, y con --project configura ese', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner, ['app', 'admin']);
    const before = snapshot(tree);

    await expect(run({}, tree)).rejects.toThrow(
      'Hay varias aplicaciones (app, admin). Elige una con --project',
    );
    expect(snapshot(tree)).toEqual(before);

    const result = await run({ project: 'admin' }, tree);
    expect(result.exists('/projects/admin/src/app/components/ui/utils/cn.ts')).toBe(true);
    expect(result.readContent('/projects/admin/src/styles.css')).toContain('theme-base.css');
    expect(result.readContent(STYLES)).not.toContain('theme-base.css');
    expect(result.readContent('/tsconfig.json')).toContain(
      '"./projects/admin/src/app/components/ui/*"',
    );
  });

  it('conserva los comentarios y los paths previos del tsconfig', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    tree.overwrite(
      '/tsconfig.json',
      [
        '/* Configuración del equipo */',
        '{',
        '  // Opciones del compilador',
        '  "compilerOptions": {',
        '    "strict": true,',
        '    "paths": {',
        '      // Variables de entorno',
        '      "@env/*": ["./env/*"]',
        '    }',
        '  }',
        '}',
        '',
      ].join('\n'),
    );

    const tsconfig = (await run({}, tree)).readContent('/tsconfig.json');
    expect(tsconfig).toContain('/* Configuración del equipo */');
    expect(tsconfig).toContain('// Opciones del compilador');
    expect(tsconfig).toContain('// Variables de entorno');
    expect(tsconfig).toContain('"@env/*": ["./env/*"]');
    expect(tsconfig).toContain(`"@/components/ui/*": [`);
    expect(tsconfig).toContain(`"./${UI}/*"`);
  });

  it('si el alias ya existe con otro valor, avisa y no lo pisa', async () => {
    const { runner, run, logs } = harness();
    const tree = await createWorkspace(runner);
    const original =
      '{\n  "compilerOptions": {\n    "paths": { "@/components/ui/*": ["./libs/ui/*"] }\n  }\n}\n';
    tree.overwrite('/tsconfig.json', original);

    const result = await run({}, tree);
    expect(result.readContent('/tsconfig.json')).toBe(original);
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('ya tiene el alias'))).toBe(
      true,
    );
  });

  it('si el tsconfig del build tiene sus propios paths, el alias va también ahí', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    tree.overwrite(
      '/projects/app/tsconfig.app.json',
      [
        '/* tsconfig de la app */',
        '{',
        '  "extends": "../../tsconfig.json",',
        '  "compilerOptions": {',
        '    // Estos paths reemplazan a los de la raíz',
        '    "paths": { "@env/*": ["./src/env/*"] }',
        '  },',
        '  "include": ["src/**/*.ts"]',
        '}',
        '',
      ].join('\n'),
    );

    const result = await run({}, tree);
    const app = result.readContent('/projects/app/tsconfig.app.json');
    expect(app).toContain('/* tsconfig de la app */');
    expect(app).toContain('// Estos paths reemplazan a los de la raíz');
    // JSONFile puede reformatear el objeto paths al agregar la clave: se comprueba el valor.
    expect(app).toMatch(/"@env\/\*": \[\s*"\.\/src\/env\/\*"\s*\]/);
    expect(app).toContain('"./src/app/components/ui/*"');
    // La raíz también lo tiene (editor y pruebas).
    expect(result.readContent('/tsconfig.json')).toContain(`"./${UI}/*"`);
  });

  it('sin paths propios, el tsconfig del build no se toca', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    const before = tree.readContent('/projects/app/tsconfig.app.json');
    const result = await run({}, tree);
    expect(result.readContent('/projects/app/tsconfig.app.json')).toBe(before);
  });

  it('con source(none) agrega el @source exacto y avisa', async () => {
    const { runner, run, logs } = harness();
    const tree = await createWorkspace(runner);
    tree.overwrite(STYLES, "@import 'tailwindcss' source(none);\n");

    const first = await run({}, tree);
    expect(first.readContent(STYLES)).toBe(
      "@import 'tailwindcss' source(none);\n" +
        '@import "./app/components/ui/theme/theme-base.css";\n' +
        '@source "./app/components/ui";\n',
    );
    expect(logs.some((l) => l.level === 'warn' && l.message.includes('source(none)'))).toBe(true);

    // Idempotente también aquí.
    const second = await run({}, first);
    expect(second.readContent(STYLES)).toBe(first.readContent(STYLES));
  });

  describe('sin Tailwind falla con un mensaje claro y sin cambios', () => {
    it('falta el paquete', async () => {
      const { runner, run } = harness();
      const tree = await createWorkspace(runner);
      const pkg = json(tree, '/package.json');
      delete pkg.devDependencies.tailwindcss;
      tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
      const before = snapshot(tree);

      await expect(run({}, tree)).rejects.toThrow(
        'Mimi necesita Tailwind CSS 4, y no está instalado. Agrégalo con "ng add tailwindcss"',
      );
      expect(snapshot(tree)).toEqual(before);
    });

    it('Tailwind 3', async () => {
      const { runner, run } = harness();
      const tree = await createWorkspace(runner);
      const pkg = json(tree, '/package.json');
      pkg.devDependencies.tailwindcss = '^3.4.0';
      tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
      await expect(run({}, tree)).rejects.toThrow('este proyecto usa Tailwind 3');
    });

    it('falta el @import en el CSS global', async () => {
      const { runner, run } = harness();
      const tree = await createWorkspace(runner);
      tree.overwrite(STYLES, 'body { margin: 0; }\n');
      const before = snapshot(tree);

      await expect(run({}, tree)).rejects.toThrow(
        'Falta @import "tailwindcss"; en el CSS global (projects/app/src/styles.css)',
      );
      expect(snapshot(tree)).toEqual(before);
    });
  });

  it('Angular 21: falla sin cambios', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    const pkg = json(tree, '/package.json');
    pkg.dependencies['@angular/core'] = '^21.2.0';
    tree.overwrite('/package.json', JSON.stringify(pkg, null, 2));
    const before = snapshot(tree);
    await expect(run({}, tree)).rejects.toThrow(
      'Mimi necesita Angular 22 o superior; este proyecto usa Angular 21',
    );
    expect(snapshot(tree)).toEqual(before);
  });

  it('usa la carpeta de mimi.json; las rutas escritas usan "/" aunque venga con "\\"', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    const config = {
      style: 'vivid',
      aliases: { components: 'projects\\app\\src\\shared\\ui\\' },
      components: {},
    };
    tree.create('/mimi.json', JSON.stringify(config, null, 2));

    const result = await run({}, tree);
    expect(result.exists('/projects/app/src/shared/ui/utils/cn.ts')).toBe(true);
    const css = result.readContent(STYLES);
    const tsconfig = result.readContent('/tsconfig.json');
    expect(css).toContain('@import "./shared/ui/theme/theme-base.css";');
    expect(tsconfig).toContain('"./projects/app/src/shared/ui/*"');
    // Ninguna ruta escrita lleva "\".
    expect(css).not.toContain('\\');
    expect(tsconfig.slice(tsconfig.indexOf('"paths"'))).not.toContain('\\');
    // mimi.json existente no se toca.
    expect(json(result, '/mimi.json')).toEqual(config);
  });

  it('--icons agrega @lucide/angular; --icons=false y sin la opción, no', async () => {
    const { runner, run } = harness();
    const workspace = await createWorkspace(runner);

    const withIcons = await run({ icons: true }, workspace);
    expect(json(withIcons, '/package.json').dependencies['@lucide/angular']).toBe(
      registry.suggestedDependencies['@lucide/angular'],
    );

    for (const options of [{ icons: false }, {}]) {
      const { runner: r2, run: run2 } = harness();
      const tree = await run2(options, await createWorkspace(r2));
      expect(
        json(tree, '/package.json').dependencies['@lucide/angular'],
        JSON.stringify(options),
      ).toBeUndefined();
    }
  });

  it('un archivo modificado se omite con aviso y se reemplaza con --overwrite', async () => {
    const { runner, run, logs } = harness();
    const tree = await createWorkspace(runner);
    tree.create(`/${UI}/utils/cn.ts`, '// mi versión\n');

    const kept = await run({}, tree);
    expect(kept.readContent(`/${UI}/utils/cn.ts`)).toBe('// mi versión\n');
    expect(
      logs.some(
        (l) =>
          l.level === 'warn' &&
          l.message ===
            `Omitido: ${UI}/utils/cn.ts ya existe con otro contenido (usa --overwrite para reemplazarlo).`,
      ),
    ).toBe(true);
    // El resto sí se configuró.
    expect(kept.exists(`/${UI}/theme/theme-base.css`)).toBe(true);

    const replaced = await run({ overwrite: true }, kept);
    expect(replaced.readContent(`/${UI}/utils/cn.ts`)).toBe(
      readFileSync(join(uiCoreLib, 'utils/cn.ts'), 'utf8'),
    );
  });
});

describe('init: copias originales en .mimi/base', () => {
  it('guarda la base de los archivos que escribe', async () => {
    const { runner, run } = harness();
    const tree = await run({}, await createWorkspace(runner));
    for (const file of BASE_FILES) {
      expect(tree.readContent(`/.mimi/base/${file}`), file).toBe(
        readFileSync(join(uiCoreLib, file), 'utf8'),
      );
    }
  });

  it('si un archivo se omite por estar modificado, no crea ni cambia su base', async () => {
    const { runner, run } = harness();
    const tree = await createWorkspace(runner);
    tree.create(`/${UI}/utils/cn.ts`, '// mi versión\n');
    const result = await run({}, tree);
    expect(result.exists('/.mimi/base/utils/cn.ts')).toBe(false);
    expect(result.exists('/.mimi/base/utils/control-styles.ts')).toBe(true);
  });
});

describe('init: schematicCollections (tarea 3.6)', () => {
  const MIMI = '@mimi-ng/cli';
  const ANGULAR = '@schematics/angular';

  it('sin el campo lo crea con @schematics/angular primero', async () => {
    const { runner, run } = harness();
    const workspace = await createWorkspace(runner);
    expect(json(workspace, '/angular.json').cli?.schematicCollections).toBeUndefined();
    const tree = await run({}, workspace);
    expect(json(tree, '/angular.json').cli.schematicCollections).toEqual([ANGULAR, MIMI]);
  });

  it('con el campo agrega Mimi al final sin quitar nada; dos ejecuciones no lo repiten', async () => {
    const { runner, run } = harness();
    const workspace = await createWorkspace(runner);
    const angular = json(workspace, '/angular.json');
    angular.cli = { ...angular.cli, schematicCollections: ['@acme/schematics', ANGULAR] };
    workspace.overwrite('/angular.json', JSON.stringify(angular, null, 2));

    const first = await run({}, workspace);
    const second = await run({}, first);
    expect(json(second, '/angular.json').cli.schematicCollections).toEqual([
      '@acme/schematics',
      ANGULAR,
      MIMI,
    ]);
    expect(second.readContent('/angular.json')).toBe(first.readContent('/angular.json'));
  });

  it('si el proyecto tiene su propio schematicCollections (gana al del workspace), también va ahí', async () => {
    const { runner, run } = harness();
    const workspace = await createWorkspace(runner);
    const angular = json(workspace, '/angular.json');
    angular.projects.app.cli = { schematicCollections: [ANGULAR] };
    workspace.overwrite('/angular.json', JSON.stringify(angular, null, 2));

    const tree = await run({}, workspace);
    const result = json(tree, '/angular.json');
    expect(result.projects.app.cli.schematicCollections).toEqual([ANGULAR, MIMI]);
    expect(result.cli.schematicCollections).toEqual([ANGULAR, MIMI]);
  });

  describe('ng g <nombre> resuelve como en la CLI de Angular', () => {
    type Schematics = Record<string, { aliases?: string[] }>;

    /**
     * Igual que @angular/cli 22 (commands/generate, getSchematics y getSchematicsToRegister):
     * recorre las colecciones en orden, descarta los schematics cuyo NOMBRE ya apareció en una
     * colección anterior (con sus alias) y gana el primero que tiene el nombre o el alias.
     */
    const resolve = (collections: [string, Schematics][], name: string) => {
      const seen = new Set<string>();
      for (const [collectionName, schematics] of collections) {
        for (const [schematic, d] of Object.entries(schematics)) {
          if (seen.has(schematic)) continue;
          seen.add(schematic);
          if (schematic === name || (d.aliases ?? []).includes(name)) return collectionName;
        }
      }
      return undefined;
    };

    async function installed() {
      const { runner, run } = harness();
      const tree = await run({}, await createWorkspace(runner));
      const order: string[] = json(tree, '/angular.json').cli.schematicCollections;
      const schematicsOf = (collectionName: string) =>
        runner.engine.createCollection(collectionName).description.schematics as Schematics;
      return { order, schematicsOf };
    }

    it('con el orden que deja init: mimi y ui van a Mimi, component a Angular', async () => {
      const { order, schematicsOf } = await installed();
      const collections = order.map((c): [string, Schematics] => [c, schematicsOf(c)]);
      expect(resolve(collections, 'mimi')).toBe(MIMI);
      expect(resolve(collections, 'ui')).toBe(MIMI);
      expect(resolve(collections, 'init')).toBe(MIMI);
      expect(resolve(collections, 'component')).toBe(ANGULAR);
      expect(resolve(collections, 'c')).toBe(ANGULAR);
      expect(resolve(collections, 'service')).toBe(ANGULAR);
    });

    it('con otra colección con un schematic "ui" antes de Mimi (como Spartan): mimi sigue yendo a Mimi', async () => {
      const { schematicsOf } = await installed();
      const other: Schematics = { ui: {} };
      const collections: [string, Schematics][] = [
        [ANGULAR, schematicsOf(ANGULAR)],
        ['otra-coleccion', other],
        [MIMI, schematicsOf(MIMI)],
      ];
      expect(resolve(collections, 'mimi')).toBe(MIMI);
      expect(resolve(collections, 'ui')).toBe('otra-coleccion');
    });
  });

  it('ningún nombre ni alias de Mimi choca con los de @schematics/angular (incluidos los ocultos)', () => {
    const { runner } = harness();
    const names = (collectionName: string) =>
      Object.entries(
        runner.engine.createCollection(collectionName).description.schematics as Record<
          string,
          { aliases?: string[] }
        >,
      ).flatMap(([name, d]) => [name, ...(d.aliases ?? [])]);
    const angular = new Set(names(ANGULAR));
    const mimi = names(MIMI);
    expect(mimi).toEqual(expect.arrayContaining(['ng-add', 'init', 'mimi', 'ui']));
    expect(mimi.filter((name) => angular.has(name))).toEqual([]);
  });
});

describe('init: repetido y formateado por Prettier', () => {
  it('la segunda vez dice que ya estaba configurado, sin repetir los pasos', async () => {
    const { runner, run, logs } = harness();
    const first = await run({}, await createWorkspace(runner));
    expect(logs.map((l) => l.message)).not.toContain(
      'Mimi ya estaba configurado; no hubo cambios.',
    );
    logs.length = 0;
    await run({}, first);
    const messages = logs.map((l) => l.message);
    expect(messages).toContain('Mimi ya estaba configurado; no hubo cambios.');
    expect(messages).not.toContain('Agrega tu primer componente:');
  });

  it('con los archivos y sus bases formateados igual: sin avisos ni cambios', async () => {
    const { runner, run, logs } = harness();
    const first = await run({}, await createWorkspace(runner));
    for (const file of BASE_FILES) {
      const formatted = first.readContent(`/${UI}/${file}`).replace(/'/g, '"');
      first.overwrite(`/${UI}/${file}`, formatted);
      first.overwrite(`/.mimi/base/${file}`, formatted);
    }
    const before = snapshot(first);
    logs.length = 0;
    const second = await run({}, first);
    expect(snapshot(second)).toEqual(before);
    expect(logs.filter((l) => l.level === 'warn')).toEqual([]);
    expect(logs.map((l) => l.message)).toContain('Mimi ya estaba configurado; no hubo cambios.');
  });

  it('si algo faltaba, no dice que ya estaba configurado', async () => {
    const { runner, run, logs } = harness();
    const first = await run({}, await createWorkspace(runner));
    first.overwrite(STYLES, "@import 'tailwindcss';\n");
    logs.length = 0;
    await run({}, first);
    expect(logs.map((l) => l.message)).not.toContain(
      'Mimi ya estaba configurado; no hubo cambios.',
    );
  });
});

describe('ng-add', () => {
  it('ejecuta init con las mismas opciones', async () => {
    const a = harness();
    const viaInit = await a.run({ icons: true }, await createWorkspace(a.runner));
    const b = harness();
    const viaNgAdd = await b.run({ icons: true }, await createWorkspace(b.runner), 'ng-add');
    expect(snapshot(viaNgAdd)).toEqual(snapshot(viaInit));
  });
});

describe('init: "style" de mimi.json (tarea V.2)', () => {
  /** Re-ejecuta init sobre un proyecto ya configurado cuyo mimi.json dice `style`. */
  async function rerunWith(style: string) {
    const { runner, run, logs } = harness();
    const first = await run({}, await createWorkspace(runner));
    const config = json(first, '/mimi.json');
    first.overwrite('/mimi.json', `${JSON.stringify({ ...config, style }, null, 2)}\n`);
    const before = first.readContent('/mimi.json');
    logs.length = 0;
    const second = await run({}, first);
    const warnings = () => logs.filter((l) => l.level === 'warn');
    return { before, second, logs, warnings };
  }

  it('init en un proyecto nuevo escribe "style": "mimi"', async () => {
    const { runner, run } = harness();
    const tree = await run({}, await createWorkspace(runner));
    expect(json(tree, '/mimi.json').style).toBe('mimi');
  });

  it('"vivid" (lo que escribe la 0.1.0) se acepta: init re-ejecutado no lo cambia ni avisa', async () => {
    const { before, second, logs, warnings } = await rerunWith('vivid');
    expect(second.readContent('/mimi.json')).toBe(before);
    expect(warnings()).toEqual([]);
    expect(logs.map((l) => l.message)).toContain('Mimi ya estaba configurado; no hubo cambios.');
  });

  it('un valor desconocido se comporta igual: la CLI no lo lee ni lo valida, y lo conserva', async () => {
    const { before, second, warnings } = await rerunWith('otro');
    expect(second.readContent('/mimi.json')).toBe(before);
    expect(warnings()).toEqual([]);
  });
});
