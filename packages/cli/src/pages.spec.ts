import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UnitTestTree } from '@angular-devkit/schematics/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import cliPackage from '../package.json';
import registryJson from './registry.json';
import type { Registry } from './registry';
import { UI_CORE_LIB, createWorkspace, harness, json, snapshot } from './testing/harness';
import {
  TEST_PAGE,
  TEST_PAGE_FILES,
  TEST_PAGE_SOURCE,
  collectionWithTestBlock,
} from './testing/test-block';
import {
  type PageTarget,
  defaultPageName,
  pageClassName,
  pageSelector,
  pageSourceFiles,
  renderPageFile,
  routeLine,
  routesConstName,
  routesFile,
} from './utils/pages';

/**
 * Blocks de tipo página (B.11): `ng g mimi <página>` genera una página del usuario en
 * `aliases.pages` (`<nombre>/<nombre>.ts`, `.html` y `.routes.ts`, clase `<Nombre>Page`), y la
 * sigue por su nombre del registro. Usa el Block de prueba `demo-01` (testing/test-block.ts) y,
 * para la conversión, los Blocks reales de ui-core.
 */

const registry = registryJson as Registry;
const APP = 'projects/app/src/app';
const UI = `${APP}/components/ui`;
const BLOCKS = `${APP}/blocks`;
const PAGES = `${APP}/pages`;
const VERSION = cliPackage.version;
const OLD = '0.1.1';
const BUTTON = ['button/button.ts', 'button/button.variants.ts', 'button/index.ts'];
/** Las claves de los archivos de la página demo-01 (las de sus bases y del manifiesto). */
const KEYS = [
  'pages/demo-01/demo-01.ts',
  'pages/demo-01/demo-01.html',
  'pages/demo-01/demo-01.routes.ts',
];
const inPage = (key: string, dir = `${PAGES}/demo`, name = 'demo') =>
  `${dir}/${key.split('/').pop()!.replace('demo-01', name)}`;
const oldContent = (file: string) => `// ${file} de la ${OLD}\n`;

const target = (item: string, name = defaultPageName(item), prefix = 'app'): PageTarget => ({
  item,
  dir: `src/app/pages/${name}`,
  name,
  prefix,
});

let collection: string;
beforeAll(() => {
  collection = collectionWithTestBlock('pages-spec');
});

async function initialized() {
  const h = harness(collection);
  const tree = await h.run('init', {}, await createWorkspace(h.runner));
  h.logs.length = 0;
  return { ...h, tree };
}

/**
 * Deja la página (y, si se pide, Button) como de una versión anterior, en su carpeta; `modified`
 * son las claves que el usuario cambió sobre esa versión.
 */
function makeOld(
  tree: UnitTestTree,
  {
    page = true,
    button = false,
    modified = [] as string[],
    dir = `${PAGES}/demo`,
    name = 'demo',
  } = {},
) {
  const manifest = json(tree, '/.mimi/manifest.json');
  const config = json(tree, '/mimi.json');
  const files = [
    ...(page ? KEYS.map((key) => ({ key, path: inPage(key, dir, name) })) : []),
    ...(button ? BUTTON.map((key) => ({ key, path: `${UI}/${key}` })) : []),
  ];
  for (const { key, path } of files) {
    const old = oldContent(key);
    tree.overwrite(`/${path}`, modified.includes(key) ? `${old}// cambio propio\n` : old);
    tree.overwrite(`/.mimi/base/${key}`, old);
    manifest.files[key] = OLD;
  }
  if (page) config.blocks[TEST_PAGE].version = OLD;
  if (button) config.components.button.version = OLD;
  tree.overwrite('/.mimi/manifest.json', JSON.stringify(manifest, null, 2));
  tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));
}

const editConfig = (tree: UnitTestTree, edit: (config: Record<string, any>) => void) => {
  const config = json(tree, '/mimi.json');
  edit(config);
  tree.overwrite('/mimi.json', JSON.stringify(config, null, 2));
};

describe('registro (B.11-a)', () => {
  it('cada Block dice si es página o sección', () => {
    const blocks = Object.entries(registry.items).filter(([, item]) => item.type === 'block');
    expect(blocks.length).toBeGreaterThan(0);
    for (const [name, item] of blocks) expect(['page', 'section'], name).toContain(item.kind);
    const pages = blocks.filter(([, item]) => item.kind === 'page').map(([name]) => name);
    expect(pages.sort()).toEqual(['login-01', 'login-02', 'otp-01', 'settings-01', 'signup-01']);
    // Y ningún ítem que no sea un Block tiene `kind`.
    for (const [name, item] of Object.entries(registry.items)) {
      if (item.type !== 'block') expect(item.kind, name).toBeUndefined();
    }
  });
});

describe('conversión de un Block en página (utils/pages)', () => {
  it('nombres: por defecto, clase, selector y constante de rutas', () => {
    expect(defaultPageName('login-01')).toBe('login');
    expect(defaultPageName('settings-01')).toBe('settings');
    expect(pageClassName('login')).toBe('LoginPage');
    expect(pageClassName('admin-login')).toBe('AdminLoginPage');
    expect(pageClassName('login-page')).toBe('LoginPage');
    expect(pageSelector('app', 'login')).toBe('app-login-page');
    expect(pageSelector('', 'login')).toBe('login-page');
    expect(pageSelector('acme', 'login-page')).toBe('acme-login-page');
    expect(routesConstName('admin-login')).toBe('ADMIN_LOGIN_ROUTES');
  });

  const pageBlocks = Object.entries(registry.items)
    .filter(([, item]) => item.kind === 'page')
    .map(([name]) => name);

  it.each(pageBlocks)(
    '%s: sin restos del Block, con la clase y el selector de la página',
    (item) => {
      const name = defaultPageName(item);
      const page = target(item);
      const fromClass = item.replace(/(^|-)([a-z0-9])/g, (_, _d, c: string) => c.toUpperCase());
      for (const file of pageSourceFiles(registry.items[item].files)) {
        const source = readFileSync(join(UI_CORE_LIB, file), 'utf8');
        const result = renderPageFile(source, page);
        expect(result, file).not.toContain(`mimi-${item}`);
        expect(result, file).not.toMatch(new RegExp(`\\b${fromClass}`));
        if (file.endsWith('.ts')) {
          expect(result).toContain(`export class ${pageClassName(name)} {`);
          expect(result).toContain(`selector: 'app-${name}-page'`);
          expect(result).toContain(`templateUrl: './${name}.html'`);
          // Las importaciones de los componentes no cambian.
          expect(result).toContain("from '@/components/ui/button'");
        }
      }
    },
  );

  it('login-01: los tipos y el id se renombran con la clase', () => {
    const source = readFileSync(join(UI_CORE_LIB, 'blocks/login-01/login-01.ts'), 'utf8');
    const result = renderPageFile(source, target('login-01'));
    expect(result).toContain('export interface LoginPageValue');
    expect(result).toContain('export type LoginPageProvider');
    expect(result).toContain('`app-login-page-${nextId++}`');
  });

  it('falla si queda algo del Block (otra forma de archivo)', () => {
    expect(() =>
      renderPageFile("import { X } from './login-01-extra';\n// login01\n", target('login-01')),
    ).not.toThrow();
    expect(() => renderPageFile('const a = Login01;\n', target('login-01'))).not.toThrow();
    expect(() =>
      renderPageFile('// La plantilla está en ./login-01.html\n', target('login-01')),
    ).toThrow('No se pudo convertir login-01 en una página: quedan ./login-01.');
  });

  it('el archivo de rutas y la línea para app.routes.ts', () => {
    const page = target('login-01');
    expect(routesFile(page)).toContain('export const LOGIN_ROUTES: Routes = [');
    expect(routesFile(page)).toContain(
      "  { path: '', loadComponent: () => import('./login').then((m) => m.LoginPage) },",
    );
    expect(routeLine(page, './pages/login/login.routes')).toBe(
      "{ path: 'login', loadChildren: () => import('./pages/login/login.routes')" +
        '.then((m) => m.LOGIN_ROUTES) },',
    );
  });
});

describe('ng g mimi <página> (B.11)', () => {
  it('genera la página en aliases.pages, con sus bases por el nombre del registro y la línea de rutas', async () => {
    const { run, tree, logs, warnings } = await initialized();
    const result = await run('mimi', { components: [TEST_PAGE] }, tree);

    const ts = result.readContent(`/${PAGES}/demo/demo.ts`);
    expect(ts).toContain("selector: 'app-demo-page'");
    expect(ts).toContain('export class DemoPage {');
    expect(ts).toContain('output<DemoPageValue>()');
    expect(ts).toContain("templateUrl: './demo.html'");
    expect(ts).toContain('`app-demo-page-${0}`');
    expect(result.readContent(`/${PAGES}/demo/demo.html`)).toBe(
      TEST_PAGE_SOURCE['blocks/demo-01/demo-01.html'],
    );
    expect(result.readContent(`/${PAGES}/demo/demo.routes.ts`)).toContain(
      "import('./demo').then((m) => m.DemoPage)",
    );
    // Sin index.ts ni copia en la carpeta de Blocks.
    expect(result.exists(`/${PAGES}/demo/index.ts`)).toBe(false);
    expect(result.exists(`/${BLOCKS}/demo-01/demo-01.ts`)).toBe(false);
    expect(result.exists(`/${UI}/button/button.ts`)).toBe(true);

    // Bases y manifiesto por el nombre del registro (B.11-f).
    for (const key of KEYS) {
      expect(result.readContent(`/.mimi/base/${key}`), key).toBe(
        result.readContent(`/${inPage(key)}`),
      );
      expect(json(result, '/.mimi/manifest.json').files[key], key).toBe(VERSION);
    }
    const config = json(result, '/mimi.json');
    expect(config.blocks).toEqual({
      [TEST_PAGE]: { version: VERSION, path: `${PAGES}/demo`, name: 'demo' },
    });
    expect(config.aliases.pages).toBe(PAGES);

    const messages = logs.map((l) => l.message);
    expect(messages).toContain(`  + ${PAGES}/demo/demo.routes.ts`);
    expect(messages).toContain(
      `demo-01 es ahora tu página demo (${PAGES}/demo/, clase DemoPage). Para abrirla en /demo, ` +
        `agrega esta línea a las rutas de ${APP}/app.routes.ts:`,
    );
    expect(messages).toContain(
      "  { path: 'demo', loadChildren: () => import('./pages/demo/demo.routes')" +
        '.then((m) => m.DEMO_ROUTES) },',
    );
    expect(warnings()).toEqual([]);
  });

  it('es idempotente', async () => {
    const { run, tree, logs } = await initialized();
    const once = await run('mimi', { components: [TEST_PAGE] }, tree);
    const before = snapshot(once);
    logs.length = 0;
    const twice = await run('mimi', { components: [TEST_PAGE] }, once);
    expect(snapshot(twice)).toEqual(before);
    expect(logs.map((l) => l.message)).toContain('Nada que hacer: los archivos ya están al día.');
  });

  it('--name: otra carpeta, otra clase y la sigue sin --name', async () => {
    const { run, tree, logs } = await initialized();
    const result = await run('mimi', { components: [TEST_PAGE], name: 'admin-demo' }, tree);
    expect(result.readContent(`/${PAGES}/admin-demo/admin-demo.ts`)).toContain(
      "selector: 'app-admin-demo-page'",
    );
    expect(result.readContent(`/${PAGES}/admin-demo/admin-demo.ts`)).toContain(
      'export class AdminDemoPage {',
    );
    expect(result.readContent(`/${PAGES}/admin-demo/admin-demo.routes.ts`)).toContain(
      'export const ADMIN_DEMO_ROUTES',
    );
    expect(result.exists(`/${PAGES}/demo/demo.ts`)).toBe(false);
    expect(json(result, '/mimi.json').blocks[TEST_PAGE]).toEqual({
      version: VERSION,
      path: `${PAGES}/admin-demo`,
      name: 'admin-demo',
    });

    // Sin --name, se actualiza donde está (no crea otra en pages/demo).
    makeOld(result, { dir: `${PAGES}/admin-demo`, name: 'admin-demo' });
    logs.length = 0;
    const updated = await run('mimi', { components: [TEST_PAGE] }, result);
    expect(updated.exists(`/${PAGES}/demo/demo.ts`)).toBe(false);
    expect(updated.readContent(`/${PAGES}/admin-demo/admin-demo.ts`)).toContain('AdminDemoPage');
    expect(logs.map((l) => l.message)).toContain(`demo-01 actualizado de ${OLD} a ${VERSION}`);

    // Con el mismo --name también; con otro, error.
    await expect(
      run('mimi', { components: [TEST_PAGE], name: 'admin-demo' }, updated),
    ).resolves.toBeDefined();
    await expect(run('mimi', { components: [TEST_PAGE], name: 'otra' }, updated)).rejects.toThrow(
      `demo-01 ya es tu página admin-demo (${PAGES}/admin-demo/)`,
    );
  });

  describe('falla antes de escribir nada', () => {
    const cases: [string, Record<string, unknown>, string][] = [
      [
        '--name inválido',
        { components: [TEST_PAGE], name: 'Admin Demo' },
        '--name "Admin Demo" no sirve como nombre de página',
      ],
      [
        '--name sin páginas',
        { components: ['button'], name: 'demo' },
        '--name es el nombre de la página que se genera, y no pediste ningún Block de tipo página',
      ],
      [
        '--name con dos páginas',
        { components: [TEST_PAGE, 'login-01'], name: 'demo' },
        '--name sirve para una sola página, y pediste demo-01, login-01',
      ],
      [
        'dos páginas en la misma carpeta',
        { components: ['login-01', 'login-02'] },
        `login-01 y login-02 irían a la misma carpeta (${PAGES}/login/)`,
      ],
    ];
    it.each(cases)('%s', async (_label, options, message) => {
      const { run, tree } = await initialized();
      const before = snapshot(tree);
      await expect(run('mimi', options, tree)).rejects.toThrow(message);
      expect(snapshot(tree)).toEqual(before);
    });

    it('la carpeta ya existe (un archivo del usuario o otra página), también con --overwrite', async () => {
      const { run, tree } = await initialized();
      tree.create(`/${PAGES}/demo/notas.md`, 'mío\n');
      const before = snapshot(tree);
      for (const overwrite of [false, true]) {
        await expect(run('mimi', { components: [TEST_PAGE], overwrite }, tree)).rejects.toThrow(
          `La carpeta ${PAGES}/demo/ ya existe, así que demo-01 no se generó ahí: Mimi no ` +
            `sobrescribe tus archivos. Elige otro nombre con --name, por ejemplo: ng g mimi ` +
            'demo-01 --name demo-2. No se cambió nada.',
        );
      }
      expect(snapshot(tree)).toEqual(before);

      const other = await initialized();
      const withLogin = await other.run('mimi', { components: ['login-01'] }, other.tree);
      await expect(other.run('mimi', { components: ['login-02'] }, withLogin)).rejects.toThrow(
        `La carpeta ${PAGES}/login/ ya existe (es tu página de login-01)`,
      );
      const second = await other.run(
        'mimi',
        { components: ['login-02'], name: 'login-2' },
        withLogin,
      );
      expect(second.readContent(`/${PAGES}/login-2/login-2.ts`)).toContain(
        'export class Login2Page',
      );
    });
  });

  it('sin aliases.pages: usa la hermana de components/ y la escribe; con aliases.pages, esa', async () => {
    const { run, tree } = await initialized();
    editConfig(tree, (config) => delete config.aliases.pages);
    const withButton = await run('mimi', { components: ['button'] }, tree);
    expect(json(withButton, '/mimi.json').aliases.pages).toBeUndefined();
    const result = await run('mimi', { components: [TEST_PAGE] }, withButton);
    expect(result.exists(`/${PAGES}/demo/demo.ts`)).toBe(true);
    expect(json(result, '/mimi.json').aliases.pages).toBe(PAGES);
    // La de Blocks no se escribe por una página.
    expect(json(result, '/mimi.json').aliases.blocks).toBe(BLOCKS);

    const custom = await initialized();
    editConfig(custom.tree, (config) => (config.aliases.pages = 'projects/app/src/app/features'));
    const inFeatures = await custom.run('mimi', { components: [TEST_PAGE] }, custom.tree);
    expect(inFeatures.exists(`/${APP}/features/demo/demo.ts`)).toBe(true);
    expect(custom.logs.map((l) => l.message)).toContain(
      "  { path: 'demo', loadChildren: () => import('./features/demo/demo.routes')" +
        '.then((m) => m.DEMO_ROUTES) },',
    );
  });

  it('el prefijo de los selectores sale de angular.json', async () => {
    const { run, tree } = await initialized();
    const angular = json(tree, '/angular.json');
    angular.projects.app.prefix = 'acme';
    tree.overwrite('/angular.json', JSON.stringify(angular, null, 2));
    const result = await run('mimi', { components: [TEST_PAGE] }, tree);
    expect(result.readContent(`/${PAGES}/demo/demo.ts`)).toContain("selector: 'acme-demo-page'");
  });

  describe('seguimiento por el nombre del registro (B.11-f)', () => {
    it('modificada sobre una versión anterior: no se toca nada de la página, con su aviso', async () => {
      const { run, tree, warnings } = await initialized();
      const installed = await run('mimi', { components: [TEST_PAGE], name: 'panel' }, tree);
      const dir = `${PAGES}/panel`;
      makeOld(installed, { modified: ['pages/demo-01/demo-01.ts'], dir, name: 'panel' });
      const result = await run('mimi', { components: [TEST_PAGE] }, installed);
      expect(result.readContent(`/${dir}/panel.ts`)).toBe(
        `${oldContent('pages/demo-01/demo-01.ts')}// cambio propio\n`,
      );
      expect(result.readContent(`/${dir}/panel.routes.ts`)).toBe(
        oldContent('pages/demo-01/demo-01.routes.ts'),
      );
      expect(json(result, '/mimi.json').blocks[TEST_PAGE]).toEqual({
        version: OLD,
        path: dir,
        name: 'panel',
      });
      expect(warnings()).toEqual([
        `demo-01 no se actualizó a ${VERSION}: es tu pantalla y la modificaste ` +
          `(${dir}/panel.ts), así que no se tocó ninguno de sus archivos. Es lo ` +
          'normal con un Block. La versión de Mimi que modificaste está en .mimi/base/pages/demo-01/, ' +
          'para comparar. Si quieres la nueva, guarda tus cambios (por ejemplo, en git) y vuelve ' +
          'a ejecutar el comando con --overwrite: reemplaza tu pantalla entera.',
      ]);
    });

    it('--overwrite la reemplaza y lo dice', async () => {
      const { run, tree, warnings } = await initialized();
      const installed = await run('mimi', { components: [TEST_PAGE] }, tree);
      makeOld(installed, { modified: ['pages/demo-01/demo-01.html'] });
      const result = await run('mimi', { components: [TEST_PAGE], overwrite: true }, installed);
      expect(result.readContent(`/${PAGES}/demo/demo.html`)).toBe(
        TEST_PAGE_SOURCE['blocks/demo-01/demo-01.html'],
      );
      expect(json(result, '/mimi.json').blocks[TEST_PAGE].version).toBe(VERSION);
      expect(warnings()).toEqual([
        `--overwrite reemplazó tu pantalla demo-01 (${PAGES}/demo/) por la de Mimi ` +
          `${VERSION}. Si tenías cambios, recupéralos de git.`,
      ]);
    });

    it('un componente bloqueado bloquea la página', async () => {
      const { run, tree, warnings } = await initialized();
      const installed = await run('mimi', { components: [TEST_PAGE] }, tree);
      makeOld(installed, { button: true, modified: ['button/button.ts'] });
      const result = await run('mimi', { components: [TEST_PAGE] }, installed);
      for (const key of KEYS)
        expect(result.readContent(`/${inPage(key)}`), key).toBe(oldContent(key));
      expect(warnings()).toContain(
        `demo-01 no se actualizó a ${VERSION}: necesita button ${VERSION}, que no se ` +
          'actualizó (ver el aviso de button).',
      );
    });

    it('M1: avisa con otro nombre, pidiendo solo el componente', async () => {
      const { run, tree, warnings } = await initialized();
      const installed = await run('mimi', { components: [TEST_PAGE], name: 'panel' }, tree);
      makeOld(installed, { page: false, button: true });
      const result = await run('mimi', { components: ['button'] }, installed);
      expect(json(result, '/mimi.json').components.button.version).toBe(VERSION);
      expect(warnings()).toEqual([
        `Tu Block demo-01 usa button, que se actualizó a ${VERSION}; revisa el CHANGELOG ` +
          'por si tu pantalla necesita algún cambio.',
      ]);
    });

    it('si el usuario mueve la carpeta y cambia path en mimi.json, se actualiza en la nueva', async () => {
      const { run, tree, logs } = await initialized();
      const installed = await run('mimi', { components: [TEST_PAGE] }, tree);
      const moved = `${APP}/admin/demo`;
      for (const key of KEYS) {
        installed.create(`/${inPage(key, moved)}`, installed.readContent(`/${inPage(key)}`));
        installed.delete(`/${inPage(key)}`);
      }
      editConfig(installed, (config) => (config.blocks[TEST_PAGE].path = moved));
      makeOld(installed, { dir: moved });
      logs.length = 0;
      const result = await run('mimi', { components: [TEST_PAGE] }, installed);
      expect(result.readContent(`/${moved}/demo.ts`)).toContain('export class DemoPage');
      expect(result.exists(`/${PAGES}/demo/demo.ts`)).toBe(false);
      expect(json(result, '/mimi.json').blocks[TEST_PAGE].path).toBe(moved);
      expect(logs.map((l) => l.message)).toContain(`demo-01 actualizado de ${OLD} a ${VERSION}`);
    });
  });

  describe('compatibilidad con la 0.4.0 (B.11-g)', () => {
    /** Como lo dejó la 0.4.0: el Block tal cual en aliases.blocks, sin path en mimi.json. */
    function installedWith040(tree: UnitTestTree, { modified = [] as string[] } = {}) {
      const manifest = json(tree, '/.mimi/manifest.json');
      for (const file of TEST_PAGE_FILES) {
        const old = oldContent(file);
        const path = file.replace(/^blocks\//, `${BLOCKS}/`);
        tree.create(`/${path}`, modified.includes(file) ? `${old}// cambio propio\n` : old);
        tree.create(`/.mimi/base/${file}`, old);
        manifest.files[file] = OLD;
      }
      tree.overwrite('/.mimi/manifest.json', JSON.stringify(manifest, null, 2));
      editConfig(tree, (config) => {
        config.blocks = { [TEST_PAGE]: { version: OLD } };
        delete config.aliases.pages;
      });
    }

    it('se actualiza donde está, como en la 0.4.0, y explica cómo pasarla a página', async () => {
      const { run, tree, logs, warnings } = await initialized();
      installedWith040(tree);
      const result = await run('mimi', { components: [TEST_PAGE] }, tree);
      for (const file of TEST_PAGE_FILES) {
        expect(result.readContent(`/${file.replace(/^blocks\//, `${BLOCKS}/`)}`), file).toBe(
          TEST_PAGE_SOURCE[file],
        );
      }
      expect(result.exists(`/${PAGES}/demo/demo.ts`)).toBe(false);
      const config = json(result, '/mimi.json');
      expect(config.blocks[TEST_PAGE]).toEqual({ version: VERSION });
      expect(config.aliases.pages).toBeUndefined();
      const messages = logs.map((l) => l.message);
      expect(messages).toContain(`demo-01 actualizado de ${OLD} a ${VERSION}`);
      expect(messages).toContain(
        `demo-01 sigue en ${BLOCKS}/demo-01/, donde lo instalaste con la 0.4.0, y se actualiza ` +
          `ahí. Los Blocks de pantalla se generan ahora como páginas (${PAGES}/demo/, DemoPage): ` +
          'para pasarlo, guarda tus cambios, borra esa carpeta y vuelve a ejecutar ng g mimi demo-01.',
      );
      expect(warnings()).toEqual([]);
    });

    it('modificada: bloqueada como en la 0.4.0; M1 sigue avisando', async () => {
      const { run, tree, warnings } = await initialized();
      installedWith040(tree, { modified: ['blocks/demo-01/demo-01.ts'] });
      const result = await run('mimi', { components: [TEST_PAGE] }, tree);
      expect(result.readContent(`/${BLOCKS}/demo-01/demo-01.html`)).toBe(
        oldContent('blocks/demo-01/demo-01.html'),
      );
      expect(warnings()[0]).toContain(
        `demo-01 no se actualizó a ${VERSION}: es tu pantalla y la modificaste ` +
          `(${BLOCKS}/demo-01/demo-01.ts)`,
      );

      const other = await initialized();
      const withOldButton = await other.run('mimi', { components: ['button'] }, other.tree);
      installedWith040(withOldButton);
      other.logs.length = 0;
      const manifest = json(withOldButton, '/.mimi/manifest.json');
      for (const key of BUTTON) {
        withOldButton.overwrite(`/${UI}/${key}`, oldContent(key));
        withOldButton.overwrite(`/.mimi/base/${key}`, oldContent(key));
        manifest.files[key] = OLD;
      }
      withOldButton.overwrite('/.mimi/manifest.json', JSON.stringify(manifest, null, 2));
      editConfig(withOldButton, (config) => (config.components.button = { version: OLD }));
      await other.run('mimi', { components: ['button'] }, withOldButton);
      expect(other.warnings()).toEqual([
        `Tu Block demo-01 usa button, que se actualizó a ${VERSION}; revisa el CHANGELOG ` +
          'por si tu pantalla necesita algún cambio.',
      ]);
    });

    it('con --name: error, sin cambiar nada', async () => {
      const { run, tree } = await initialized();
      installedWith040(tree);
      const before = snapshot(tree);
      await expect(run('mimi', { components: [TEST_PAGE], name: 'demo' }, tree)).rejects.toThrow(
        `demo-01 está instalado como en la 0.4.0, en ${BLOCKS}/demo-01/`,
      );
      expect(snapshot(tree)).toEqual(before);
    });

    it('si el usuario borra la carpeta, se genera como página', async () => {
      const { run, tree } = await initialized();
      installedWith040(tree);
      for (const file of TEST_PAGE_FILES)
        tree.delete(`/${file.replace(/^blocks\//, `${BLOCKS}/`)}`);
      const result = await run('mimi', { components: [TEST_PAGE] }, tree);
      expect(result.readContent(`/${PAGES}/demo/demo.ts`)).toContain('export class DemoPage');
      expect(json(result, '/mimi.json').blocks[TEST_PAGE]).toEqual({
        version: VERSION,
        path: `${PAGES}/demo`,
        name: 'demo',
      });
      expect(json(result, '/mimi.json').aliases.pages).toBe(PAGES);
    });
  });

  describe('M2 para las páginas', () => {
    it.each([
      [
        'aliases.pages',
        (c: Record<string, any>) => (c.aliases.pages = 'C:\\pages'),
        'es una ruta absoluta',
      ],
      [
        'blocks.demo-01.path',
        (c: Record<string, any>) => (c.blocks = { [TEST_PAGE]: { version: OLD, path: '../demo' } }),
        'tiene «..» (saldría del proyecto)',
      ],
    ])('%s inválido falla sin cambiar nada', async (key, edit, reason) => {
      const { run, tree } = await initialized();
      editConfig(tree, edit);
      const before = snapshot(tree);
      await expect(run('mimi', { components: [TEST_PAGE] }, tree)).rejects.toThrow(
        `mimi.json → ${key} ${reason}`,
      );
      expect(snapshot(tree)).toEqual(before);
    });
  });

  it('source(none): agrega el @source de la carpeta de páginas (B.11-i)', async () => {
    const CSS = '/projects/app/src/styles.css';
    const h = harness(collection);
    let tree = await createWorkspace(h.runner);
    tree.overwrite(CSS, "@import 'tailwindcss' source(none);\n");
    tree = await h.run('init', {}, tree);
    // Como un proyecto de la 0.4.0: init escribió los de componentes y Blocks.
    tree.overwrite(
      CSS,
      tree
        .readContent(CSS)
        .split('\n')
        .filter((l) => !l.includes('/pages'))
        .join('\n'),
    );
    editConfig(tree, (config) => delete config.aliases.pages);
    h.logs.length = 0;
    const result = await h.run('mimi', { components: [TEST_PAGE] }, tree);
    expect(result.readContent(CSS)).toBe(
      "@import 'tailwindcss' source(none);\n" +
        '@import "./app/components/ui/theme/theme-base.css";\n' +
        '@source "./app/components/ui";\n' +
        '@source "./app/blocks";\n' +
        '@source "./app/pages";\n',
    );
    expect(h.logs.map((l) => l.message).join('\n')).toContain('  @source "./app/pages";');
  });
});
