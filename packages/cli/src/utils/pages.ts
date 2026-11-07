/**
 * Blocks de tipo página (B.11): `ng g mimi login-01` no copia el Block tal cual (`Login01`,
 * `mimi-login-01`), sino que genera una página del usuario en `aliases.pages`
 * (`src/app/pages/login/login.ts`, clase `LoginPage`) con su archivo de rutas.
 *
 * Solo funciones de texto, sin schematics: lo usa también el sitio para mostrar el código como
 * lo genera la CLI.
 *
 * **Seguimiento por el nombre del registro (B.11-f):** los archivos de una página se identifican
 * con claves `pages/<ítem>/…` (`pages/login-01/login-01.ts`), que son también las de sus bases
 * (`.mimi/base/pages/login-01/`) y las del manifiesto. La carpeta y el nombre que eligió el
 * usuario solo deciden dónde se escriben y cómo se llaman.
 */

/** Dónde y con qué nombre se genera una página. */
export interface PageTarget {
  /** Nombre del Block en el registro (`login-01`). */
  item: string;
  /** Carpeta de la página en el workspace (`src/app/pages/login`). */
  dir: string;
  /** Nombre de la página: de los archivos, la clase y la ruta (`login`). */
  name: string;
  /** Prefijo de los selectores del proyecto (`app`, de angular.json). Vacío: sin prefijo. */
  prefix: string;
}

/** Prefijo de las claves de los archivos de una página. */
export const PAGES_PREFIX = 'pages/';

/** ¿Es la clave de un archivo de una página? */
export const isPageFile = (file: string) => file.startsWith(PAGES_PREFIX);

/** Nombre válido para `--name`: kebab-case, empieza con una letra (`login`, `admin-login`). */
export const PAGE_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** Nombre por defecto: el del registro sin el número (`login-01` → `login`). */
export const defaultPageName = (item: string) => item.replace(/-\d+$/, '');

const pascal = (kebab: string) =>
  kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const endsWithPage = (name: string) => name === 'page' || name.endsWith('-page');

/** `login` → `LoginPage`; `login-page` → `LoginPage` (sin repetir «Page»). */
export const pageClassName = (name: string) =>
  endsWithPage(name) ? pascal(name) : `${pascal(name)}Page`;

/** `app` y `login` → `app-login-page`; sin prefijo, `login-page`. */
export function pageSelector(prefix: string, name: string): string {
  const base = endsWithPage(name) ? name : `${name}-page`;
  return prefix ? `${prefix}-${base}` : base;
}

/** `login` → `LOGIN_ROUTES`; `admin-login` → `ADMIN_LOGIN_ROUTES`. */
export const routesConstName = (name: string) => `${name.replace(/-/g, '_').toUpperCase()}_ROUTES`;

const basename = (file: string) => file.slice(file.lastIndexOf('/') + 1);

/** Los archivos del Block que pasan a la página: todos menos su `index.ts`. */
export const pageSourceFiles = (files: string[]) =>
  files.filter((file) => basename(file) !== 'index.ts');

/** Clave del archivo de rutas (`pages/login-01/login-01.routes.ts`). */
export const routesKey = (item: string) => `${PAGES_PREFIX}${item}/${item}.routes.ts`;

/** Clave de un archivo del Block en la página: `blocks/login-01/login-01.html` → `pages/login-01/login-01.html`. */
export const pageKeyOf = (item: string, file: string) => `${PAGES_PREFIX}${item}/${basename(file)}`;

/** Las claves de los archivos de una página: los del Block (sin `index.ts`) y el de rutas. */
export const pageKeys = (item: string, files: string[]) => [
  ...pageSourceFiles(files).map((file) => pageKeyOf(item, file)),
  routesKey(item),
];

/** El ítem de una clave de página (`pages/login-01/login-01.ts` → `login-01`). */
export const pageItemOf = (key: string) => key.slice(PAGES_PREFIX.length).split('/')[0];

/**
 * Ruta en el workspace de un archivo de la página: `pages/login-01/login-01.ts` con
 * `{ dir: 'src/app/pages/login', name: 'login' }` → `src/app/pages/login/login.ts`.
 */
export function pageTargetPath(key: string, target: PageTarget): string {
  const file = basename(key);
  const rest = file.startsWith(target.item) ? file.slice(target.item.length) : `.${file}`;
  return `${target.dir}/${target.name}${rest}`;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `settings-01` → `SETTINGS_01`; `Login-Page` → `LOGIN_PAGE`. */
const constantCase = (kebab: string) => kebab.replace(/-/g, '_').toUpperCase();

/**
 * ¿El nombre de página contiene el del Block (`login-01`, `login-01-x`)? La conversión no
 * distinguiría lo viejo de lo nuevo: `ng g mimi` lo rechaza con su propio mensaje.
 */
export const isBlockLikeName = (item: string, name: string) =>
  name === item || name.startsWith(`${item}-`);

/**
 * El código de un archivo del Block convertido en el de la página: el selector `mimi-login-01`
 * (también en los `id`) pasa a `app-login-page`; la clase `Login01` y sus tipos (`Login01Value`)
 * a `LoginPage` (`LoginPageValue`); las constantes (`SETTINGS_01_PLAN`) a `SETTINGS_PAGE_PLAN`;
 * los archivos propios (`./login-01.html`) a `./login.html`. Lanza un error si queda algo del
 * nombre del Block (un Block nuevo con otra forma necesita que se revise esta función; lo prueba
 * `pages.spec.ts` con los Blocks reales). El nombre de la página no puede contener el del Block
 * (`--name login-01`): lo rechaza antes `isBlockLikeName`.
 */
export function renderPageFile(source: string, target: PageTarget): string {
  const { item, name } = target;
  const fromClass = pascal(item);
  const fromConstant = constantCase(item);
  const result = source
    .split(`mimi-${item}`)
    .join(pageSelector(target.prefix, name))
    .replace(new RegExp(`(['"\`])\\./${escape(item)}\\.`, 'g'), `$1./${name}.`)
    .replace(new RegExp(`\\b${escape(fromClass)}`, 'g'), pageClassName(name))
    .replace(
      new RegExp(`\\b${escape(fromConstant)}(?=_|\\b)`, 'g'),
      constantCase(pageClassName(name).replace(/([a-z0-9])([A-Z])/g, '$1-$2')),
    );
  const left = [`mimi-${item}`, `./${item}.`].filter((text) => result.includes(text));
  if (new RegExp(`\\b${escape(fromClass)}`).test(result)) left.push(fromClass);
  if (new RegExp(`\\b${escape(fromConstant)}(?=_|\\b)`).test(result)) left.push(fromConstant);
  if (left.length > 0) {
    throw new Error(
      `No se pudo convertir ${item} en una página: quedan ${left.join(', ')}. Es un error de Mimi; ` +
        'avísanos en https://github.com/nuki23/mimi-ng/issues.',
    );
  }
  return result;
}

/** `login.routes.ts`: la página en carga diferida, lista para `loadChildren`. */
export function routesFile(target: PageTarget): string {
  const className = pageClassName(target.name);
  return [
    "import type { Routes } from '@angular/router';",
    '',
    '/**',
    ` * Rutas de la página ${target.name} (${target.item} de Mimi). La página se carga al entrar en`,
    ' * ella. En app.routes.ts, con loadChildren (ng g mimi te dio la línea exacta).',
    ' */',
    `export const ${routesConstName(target.name)}: Routes = [`,
    `  { path: '', loadComponent: () => import('./${target.name}').then((m) => m.${className}) },`,
    '];',
    '',
  ].join('\n');
}

/**
 * La línea para `app.routes.ts` (que está en `appDir`): `{ path: 'login', loadChildren: () =>
 * import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES) },`.
 */
export function routeLine(target: PageTarget, routesImport: string): string {
  return (
    `{ path: '${target.name}', loadChildren: () => import('${routesImport}')` +
    `.then((m) => m.${routesConstName(target.name)}) },`
  );
}
