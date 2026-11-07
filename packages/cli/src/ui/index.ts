import { type Rule, SchematicsException, type Tree, chain } from '@angular-devkit/schematics';
import {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  addDependency,
} from '@schematics/angular/utility';
import { hasDirective, insertAfterTheme } from '../init/css';
import { INIT_ITEMS } from '../init/items';
import { normalizePath, relativePath } from '../init/paths';
import { isPageBlock, registry, resolveItems } from '../registry';
import {
  PAGE_NAME,
  type PageTarget,
  defaultPageName,
  isPageFile,
  pageClassName,
  pageItemOf,
  routeLine,
  routesKey,
} from '../utils/pages';
import {
  type BlockEntry,
  type MimiConfig,
  type PackageJson,
  allDependencies,
  assertAliases,
  defaultBlocksDir,
  defaultPagesDir,
  readJson,
} from '../utils/project';
import {
  mimiSourceNotLine,
  missingMimiExclusion,
  tailwindSupportsSourceNot,
  withFolderSource,
} from '../utils/tailwind';
import {
  BASE_DIR,
  type FileReport,
  type Pages,
  blockedMessages,
  emptyReport,
  hasFileChanges,
  isBlockFile,
  itemFiles,
  targetPathOf,
  updatedMessages,
  writeTemplates,
} from '../utils/write-files';

export interface UiOptions {
  components?: string[];
  overwrite?: boolean;
  /** Nombre de la página (B.11-c), solo con un Block de tipo `page`: `--name admin-login`. */
  name?: string;
}

const namesOf = (type: 'component' | 'block') =>
  Object.entries(registry.items)
    .filter(([, item]) => item.type === type)
    .map(([name]) => name)
    .sort();

/**
 * Lo que se puede agregar: los ítems `component` del registro y, después, los `block` (B.1-c;
 * el mismo orden que el x-prompt).
 */
export const AVAILABLE = [...namesOf('component'), ...namesOf('block')];

/** Lo que ui averigua antes de escribir nada. */
interface Plan {
  componentsDir: string;
  /** Carpeta de los Blocks: `aliases.blocks` de mimi.json o la de por defecto. */
  blocksDir: string;
  /** Carpeta de las páginas: `aliases.pages` de mimi.json o la de por defecto (B.11-b). */
  pagesDir: string;
  /** Los Blocks de tipo `page` de esta ejecución que se generan como páginas, con su carpeta. */
  pages: Pages;
  /**
   * Blocks de tipo `page` instalados con la 0.4.0 (en `aliases.blocks`, sin `path` en mimi.json):
   * se quedan y se actualizan donde están, como en la 0.4.0 (B.11-g).
   */
  legacyPages: string[];
  config: MimiConfig;
  /** Ítems a copiar: los pedidos y sus registryDependencies, sin repetir. */
  items: string[];
  /**
   * Lo que copia init (el tema y sus utilidades) que no está en `items`: se revisa siempre, para
   * que el tema no quede en una versión anterior a la de los componentes.
   */
  implicit: string[];
  /** Paquetes que se agregan a package.json (los que el proyecto no tiene). */
  newPackages: Record<string, string>;
  /** cdk o aria que quedan por debajo del mínimo del registro (M.4): solo se avisa. */
  outdated: OutdatedPeer[];
  /** Los de cdk y aria que el proyecto tendrá (declarados o agregados): van en el `ng update`. */
  updatable: string[];
  /**
   * Falta excluir `.mimi/` del escaneo de Tailwind (4.1 o superior) en el CSS global: solo se
   * avisa, con la línea exacta (init la escribe; ng g mimi no toca esa parte del CSS).
   */
  missingExclusion: { cssPath: string; line: string } | null;
}

interface OutdatedPeer {
  name: string;
  /** Lo que tiene el proyecto: la versión instalada o el rango de package.json. */
  current: string;
  /** De dónde sale `current`: node_modules, package.json o lo que la CLI agrega ahora. */
  source: 'installed' | 'declared' | 'added';
  /** El mínimo que pide el registro (por ejemplo, 22.2.4 de `^22.2.4`). */
  required: string;
}

/**
 * `ng g mimi button input form-field`: copia los componentes y sus dependencias del registro a la
 * carpeta de mimi.json. Sin nombres, pregunta (x-prompt de selección múltiple).
 *
 * Requiere init (mimi.json). Revisa también el tema y lo que copia init, y lo actualiza si el
 * usuario no lo modificó. Todo o nada por componente (ver writeTemplates): si el usuario modificó
 * un archivo de una versión anterior, ese componente y los que dependen de él no se tocan, con
 * un aviso; --overwrite reemplaza. Guarda la copia original en .mimi/base/ y la versión de cada
 * componente en mimi.json. Instala las dependencias que falten con el gestor del proyecto.
 */
export function ui(options: UiOptions): Rule {
  return (tree: Tree): Rule => {
    const plan = inspect(tree, options);
    const report = emptyReport();
    return chain([
      writeTemplates({
        items: [...plan.items, ...plan.implicit],
        implicit: plan.implicit,
        componentsDir: plan.componentsDir,
        blocksDir: plan.blocksDir,
        pages: plan.pages,
        overwrite: options.overwrite ?? false,
        version: registry.version,
        report,
      }),
      updateMimiConfig(plan, report),
      updateGlobalCss(plan),
      addFolderSources(plan),
      ...Object.entries(plan.newPackages).map(([name, version]) =>
        addDependency(name, version, {
          type: DependencyType.Default,
          existing: ExistingBehavior.Skip,
          install: InstallBehavior.Auto,
        }),
      ),
      summary(plan, report),
    ]);
  };
}

// ── Verificaciones (sin escribir) ─────────────────────────────────────────────────────

function inspect(tree: Tree, options: UiOptions): Plan {
  const config = readJson<MimiConfig>(tree, 'mimi.json');
  if (!config) {
    throw new SchematicsException(
      'Mimi no está configurado en este proyecto (falta mimi.json). Ejecuta primero:\n' +
        '  ng add @mimi-ng/cli',
    );
  }
  assertAliases(config);

  const requested = [...new Set((options.components ?? []).map((name) => name.trim()))].filter(
    Boolean,
  );
  if (requested.length === 0) {
    throw new SchematicsException(
      `Indica qué componentes agregar, por ejemplo: ng g mimi button\nDisponibles: ${AVAILABLE.join(', ')}.`,
    );
  }
  const unknown = requested.filter((name) => !AVAILABLE.includes(name));
  if (unknown.length > 0) {
    const lines = unknown.map((name) => {
      const suggestion = closest(name);
      return `"${name}" no es un componente ni un Block de Mimi.${suggestion ? ` ¿Quisiste decir ${suggestion}?` : ''}`;
    });
    throw new SchematicsException(`${lines.join('\n')}\nDisponibles: ${AVAILABLE.join(', ')}.`);
  }

  const items: string[] = [];
  for (const name of requested) {
    for (const item of resolveItems(name)) if (!items.includes(item)) items.push(item);
  }

  const pkg = readJson<PackageJson>(tree, 'package.json');
  const installed = allDependencies(pkg);
  const angularRange = installed['@angular/core'];
  const newPackages: Record<string, string> = {};
  for (const item of items) {
    for (const [name, version] of Object.entries(registry.items[item].dependencies ?? {})) {
      if (!installed[name]) newPackages[name] = version;
    }
    // peerDependencies: solo si el proyecto no las tiene. Las de Angular, con el rango de
    // @angular/core del proyecto, para que no queden desalineadas.
    for (const [name, version] of Object.entries(registry.items[item].peerDependencies ?? {})) {
      if (installed[name]) continue;
      newPackages[name] =
        name === '@angular/aria'
          ? ariaVersion(tree, installed, version)
          : name.startsWith('@angular/') && angularRange
            ? angularRange
            : version;
    }
  }
  // aria necesita el cdk (bidi, a11y, platform). Un ítem que solo importa aria (Tabs) no declara
  // el cdk como peer; sin otro ítem que lo traiga, va con la misma versión que aria.
  if (newPackages['@angular/aria'] && !installed['@angular/cdk'] && !newPackages['@angular/cdk']) {
    newPackages['@angular/cdk'] = newPackages['@angular/aria'];
  }

  const implicit = [...new Set(INIT_ITEMS.flatMap((item) => resolveItems(item)))].filter(
    (item) => !items.includes(item),
  );

  const componentsDir = normalizePath(config.aliases?.components ?? 'src/app/components/ui');
  const blocksDir = normalizePath(config.aliases?.blocks ?? defaultBlocksDir(componentsDir));
  const pagesDir = normalizePath(config.aliases?.pages ?? defaultPagesDir(componentsDir));
  const { pages, legacyPages } = planPages(tree, config, items, options.name, blocksDir, pagesDir);
  const outdated = outdatedPeers(tree, items, installed, newPackages);
  const updatable = PEERS_WITH_MINIMUM.filter((name) => installed[name] || newPackages[name]);
  const missingExclusion = mimiExclusion(tree, config, installed);
  return {
    componentsDir,
    blocksDir,
    pagesDir,
    pages,
    legacyPages,
    config,
    items,
    implicit,
    newPackages,
    outdated,
    updatable,
    missingExclusion,
  };
}

// ── Páginas (B.11) ────────────────────────────────────────────────────────────────────

/**
 * Dónde va cada Block de tipo `page` de esta ejecución. Todo se comprueba antes de escribir: si
 * algo no cuadra (un `--name` inválido, una carpeta que ya existe y no es esa página, dos páginas
 * en la misma carpeta), falla sin cambiar nada.
 *
 * - Ya generada (`mimi.json → blocks.<ítem>.path`): se actualiza ahí, con su nombre (B.11-f).
 * - Instalada con la 0.4.0 (`<aliases.blocks>/<ítem>/<ítem>.ts`, sin `path`): se queda donde está
 *   y se actualiza como antes (B.11-g).
 * - Nueva: `<aliases.pages>/<nombre>/`, con `--name` o el nombre por defecto (B.11-c).
 */
function planPages(
  tree: Tree,
  config: MimiConfig,
  items: string[],
  name: string | undefined,
  blocksDir: string,
  pagesDir: string,
): { pages: Pages; legacyPages: string[] } {
  const pageItems = items.filter((item) => isPageBlock(item));
  if (name !== undefined) {
    if (!PAGE_NAME.test(name)) {
      throw new SchematicsException(
        `--name ${JSON.stringify(name)} no sirve como nombre de página: usa minúsculas, números y ` +
          'guiones, empezando con una letra (por ejemplo, --name admin-login). No se cambió nada.',
      );
    }
    if (pageItems.length !== 1) {
      const pageNames = AVAILABLE.filter((item) => isPageBlock(item)).join(', ');
      throw new SchematicsException(
        (pageItems.length === 0
          ? '--name es el nombre de la página que se genera, y no pediste ningún Block de tipo página'
          : `--name sirve para una sola página, y pediste ${pageItems.join(', ')}: agrégalas por separado`) +
          ` (son páginas: ${pageNames}). No se cambió nada.`,
      );
    }
  }

  const prefix = projectPrefix(tree, pagesDir);
  const pages: Pages = {};
  const legacyPages: string[] = [];
  const taken = new Map<string, string>();
  for (const item of pageItems) {
    const entry: BlockEntry | undefined = config.blocks?.[item];
    let target: PageTarget;
    if (entry?.path) {
      const dir = normalizePath(entry.path);
      const trackedName = entry.name && PAGE_NAME.test(entry.name) ? entry.name : basename(dir);
      if (name !== undefined && name !== trackedName) {
        throw new SchematicsException(
          `${item} ya es tu página ${trackedName} (${dir}/): Mimi la sigue por su nombre del ` +
            `registro, así que está en un solo sitio. Para actualizarla, ejecuta ng g mimi ${item} ` +
            'sin --name. Si quieres otra copia con otro nombre, renombra o mueve la tuya y cambia ' +
            `"path" y "name" de blocks.${item} en mimi.json. No se cambió nada.`,
        );
      }
      target = { item, dir, name: trackedName, prefix };
    } else if (tree.exists(`${blocksDir}/${item}/${item}.ts`)) {
      if (name !== undefined) {
        throw new SchematicsException(
          `${item} está instalado como en la 0.4.0, en ${blocksDir}/${item}/, y se sigue ` +
            'actualizando ahí. Para generarlo como página, guarda tus cambios (por ejemplo, en git), ' +
            `borra esa carpeta y vuelve a ejecutar el comando. No se cambió nada.`,
        );
      }
      legacyPages.push(item);
      continue;
    } else {
      const pageName = name ?? defaultPageName(item);
      const dir = `${pagesDir}/${pageName}`;
      if (hasContent(tree, dir)) {
        const owner = Object.entries(config.blocks ?? {}).find(
          ([, other]) => other?.path && normalizePath(other.path) === dir,
        )?.[0];
        throw new SchematicsException(
          `La carpeta ${dir}/ ya existe${owner ? ` (es tu página de ${owner})` : ''}, así que ` +
            `${item} no se generó ahí: Mimi no sobrescribe tus archivos. Elige otro nombre con ` +
            `--name, por ejemplo: ng g mimi ${item} --name ${pageName}-2. No se cambió nada.`,
        );
      }
      target = { item, dir, name: pageName, prefix };
    }
    const other = taken.get(target.dir);
    if (other) {
      throw new SchematicsException(
        `${other} y ${item} irían a la misma carpeta (${target.dir}/). Agrégalos por separado, ` +
          `uno de ellos con --name (por ejemplo: ng g mimi ${item} --name ${target.name}-2). ` +
          'No se cambió nada.',
      );
    }
    taken.set(target.dir, item);
    pages[item] = target;
  }
  return { pages, legacyPages };
}

const basename = (path: string) => path.slice(path.lastIndexOf('/') + 1);

/** ¿La carpeta existe y tiene algo dentro? (Un árbol de schematics no tiene carpetas vacías.) */
function hasContent(tree: Tree, dir: string): boolean {
  const entry = tree.getDir(dir);
  return entry.subfiles.length + entry.subdirs.length > 0;
}

interface AngularJson {
  projects?: Record<
    string,
    { root?: string; sourceRoot?: string; prefix?: unknown; projectType?: string }
  >;
}

/**
 * Prefijo de los selectores (`app`, de angular.json → projects → prefix): el del proyecto que
 * contiene la carpeta de páginas o, si no, el de la única aplicación. Si no se sabe, `app`.
 */
function projectPrefix(tree: Tree, dir: string): string {
  let workspace: AngularJson | null = null;
  try {
    workspace = readJson<AngularJson>(tree, 'angular.json');
  } catch {
    return 'app';
  }
  const projects = Object.values(workspace?.projects ?? {});
  const sourceOf = (project: (typeof projects)[number]) =>
    normalizePath(project.sourceRoot ?? `${project.root ?? ''}/src`);
  const inside = projects
    .filter((project) => `${dir}/`.startsWith(`${sourceOf(project)}/`))
    .sort((a, b) => sourceOf(b).length - sourceOf(a).length);
  const apps = projects.filter((project) => project.projectType === 'application');
  const project = inside[0] ?? (apps.length === 1 ? apps[0] : undefined);
  return typeof project?.prefix === 'string' && /^[a-z][a-z0-9-]*$|^$/.test(project.prefix)
    ? project.prefix
    : 'app';
}

/**
 * Cómo importa `app.routes.ts` el archivo de rutas de una página: relativo a la carpeta `app/`
 * que contiene la página (`src/app/pages/login` → `./pages/login/login.routes`). Si la página no
 * está dentro de una carpeta `app/`, la ruta del workspace (y `appDir` null: hay que ajustarla).
 */
function routesImportOf(page: PageTarget): { path: string; appDir: string | null } {
  const routes = `${page.dir}/${page.name}.routes`;
  const at = `/${page.dir}/`.lastIndexOf('/app/');
  if (at < 0) return { path: routes, appDir: null };
  const appDir = page.dir.slice(0, at + 3);
  return { path: relativePath(appDir, routes), appDir };
}

/**
 * Sin `@source not` hacia `.mimi/`, Tailwind escanea las copias originales (van en git) y genera
 * sus clases aunque el usuario ya las haya cambiado en sus componentes. Proyectos de la 0.3.0 o
 * anteriores no la tienen: se avisa para que no tengan que volver a ejecutar ng add. Con
 * Tailwind 4.0 no se avisa aquí (no la entiende; init ya lo explicó).
 */
function mimiExclusion(
  tree: Tree,
  config: MimiConfig,
  installed: Record<string, string>,
): Plan['missingExclusion'] {
  const cssPath = config.tailwind?.css;
  if (!cssPath || !tree.exists(cssPath)) return null;
  if (!tailwindSupportsSourceNot(tree, installed['tailwindcss'])) return null;
  if (!missingMimiExclusion(tree.readText(cssPath), cssPath)) return null;
  return { cssPath, line: mimiSourceNotLine(cssPath) };
}

// ── Versiones mínimas de cdk y aria (M.4) ─────────────────────────────────────────────

/**
 * Paquetes cuya versión mínima se vigila. La CLI no los cambia si el proyecto ya los tiene (se
 * actualizan con `ng update`, junto con el resto de Angular), pero avisa si quedan por debajo de
 * lo que pide el registro: con aria y cdk 22.2.3, Combobox y Select lanzan NG0950 (spec 4,
 * «#33974»).
 */
const PEERS_WITH_MINIMUM = ['@angular/cdk', '@angular/aria'];

type Version = [number, number, number];

const RANGE = /^\s*(\^|~|>=|=)?\s*v?(\d+)\.(\d+)\.(\d+)\s*$/;

function parseRange(range: string): { op: string; version: Version } | null {
  const match = RANGE.exec(range);
  if (!match) return null;
  return { op: match[1] ?? '=', version: [+match[2], +match[3], +match[4]] };
}

function compare(a: Version, b: Version): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Si un rango puede instalar `required` o una posterior. Lo que no se entiende (`*`, `latest`,
 * `22.2.x`, `workspace:`…) cuenta como que sí: el aviso no da falsas alarmas.
 */
function canReach(range: string, required: Version): boolean {
  const parsed = parseRange(range);
  if (!parsed) return true;
  if (parsed.op === '>=' || compare(parsed.version, required) >= 0) return true;
  // Por debajo del mínimo: llega solo si el tope del rango (exclusivo) queda por encima.
  const [major, minor, patch] = parsed.version;
  const upper: Version | null =
    parsed.op === '^'
      ? major > 0
        ? [major + 1, 0, 0]
        : minor > 0
          ? [0, minor + 1, 0]
          : [0, 0, patch + 1]
      : parsed.op === '~'
        ? [major, minor + 1, 0]
        : null;
  return upper !== null && compare(required, upper) < 0;
}

/** El mínimo que piden los ítems para cada paquete vigilado (aria implica el mismo cdk). */
function requiredMinimums(items: string[]): Map<string, Version> {
  const minimums = new Map<string, Version>();
  for (const item of items) {
    const { dependencies = {}, peerDependencies = {} } = registry.items[item];
    for (const [name, range] of Object.entries({ ...dependencies, ...peerDependencies })) {
      if (!PEERS_WITH_MINIMUM.includes(name)) continue;
      const version = parseRange(range)?.version;
      if (!version) continue;
      const names = name === '@angular/aria' ? [name, '@angular/cdk'] : [name];
      for (const target of names) {
        const known = minimums.get(target);
        if (!known || compare(version, known) > 0) minimums.set(target, version);
      }
    }
  }
  return minimums;
}

function outdatedPeers(
  tree: Tree,
  items: string[],
  installed: Record<string, string>,
  newPackages: Record<string, string>,
): OutdatedPeer[] {
  const outdated: OutdatedPeer[] = [];
  for (const [name, required] of requiredMinimums(items)) {
    const declared = installed[name] ?? newPackages[name];
    if (!declared) continue;
    // Si ya está instalado, manda la versión de node_modules (la que corre de verdad).
    const onDisk = installed[name] ? installedVersion(tree, name) : null;
    const version = onDisk ? parseRange(onDisk)?.version : null;
    const ok = version ? compare(version, required) >= 0 : canReach(declared, required);
    if (!ok) {
      outdated.push({
        name,
        current: onDisk ?? declared,
        source: onDisk ? 'installed' : installed[name] ? 'declared' : 'added',
        required: required.join('.'),
      });
    }
  }
  return outdated.sort((a, b) => a.name.localeCompare(b.name));
}

const SOURCE_TEXT: Record<OutdatedPeer['source'], (current: string) => string> = {
  installed: (current) => `${current} instalada`,
  declared: (current) => `"${current}" en package.json`,
  added: (current) => `"${current}", que se agrega ahora`,
};

function installedVersion(tree: Tree, name: string): string | null {
  const file = tree.read(`node_modules/${name}/package.json`);
  if (!file) return null;
  const { version } = JSON.parse(file.toString('utf-8')) as { version?: string };
  return version ?? null;
}

/**
 * @angular/aria pide como peer la versión exacta de @angular/cdk (22.1.7 → cdk 22.1.7). Si el cdk
 * está instalado, aria va en esa versión (de `node_modules`, que el árbol del schematic lee del
 * disco); si está declarado pero sin instalar, con su mismo rango; si no hay cdk, con el rango de
 * `@angular/core`, igual que el cdk que se agrega junto con él (lo declare otro ítem o no).
 */
function ariaVersion(tree: Tree, installed: Record<string, string>, fallback: string): string {
  const cdk = tree.read('node_modules/@angular/cdk/package.json');
  if (cdk) {
    const { version } = JSON.parse(cdk.toString('utf-8')) as { version?: string };
    if (version) return version;
  }
  return installed['@angular/cdk'] ?? installed['@angular/core'] ?? fallback;
}

/** El componente más parecido (distancia de edición ≤ 2, o que empiece igual). */
function closest(name: string): string | null {
  const lower = name.toLowerCase();
  let best: { name: string; distance: number } | null = null;
  for (const candidate of AVAILABLE) {
    const distance = candidate.startsWith(lower) ? 1 : editDistance(lower, candidate);
    if (distance <= 2 && (!best || distance < best.distance)) best = { name: candidate, distance };
  }
  return best?.name ?? null;
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

// ── mimi.json ─────────────────────────────────────────────────────────────────────────

/**
 * Registra la versión de cada componente cuyos archivos quedaron iguales a la plantilla. Si
 * alguno se omitió por estar modificado, o el componente no se escribió (bloqueado), se conserva
 * lo que había (y uno que no se agregó no aparece).
 */
function updateMimiConfig(plan: Plan, report: FileReport): Rule {
  return (tree) => {
    const skipped = new Set(report.skipped);
    const blocked = new Set(report.blocked.map((b) => b.item));
    const components = { ...plan.config.components };
    const blocks = { ...plan.config.blocks };
    for (const item of plan.items) {
      const { type } = registry.items[item];
      if (type !== 'component' && type !== 'block') continue;
      if (blocked.has(item)) continue;
      if (itemFiles(item, plan.pages).some((file) => skipped.has(file))) continue;
      if (type === 'component') {
        components[item] = { version: registry.version };
        continue;
      }
      // Una página guarda dónde está y con qué nombre se generó (B.11-f).
      const page = plan.pages[item];
      blocks[item] = page
        ? { version: registry.version, path: page.dir, name: page.name }
        : { version: registry.version };
    }
    const next: MimiConfig = { ...plan.config, components };
    if (Object.keys(blocks).length > 0) {
      next.blocks = blocks;
      // Proyectos anteriores: la carpeta queda escrita la primera vez que se copia un Block
      // (B.1-a) o se genera una página (B.11-b).
      const entries = Object.values(blocks);
      const aliases = { ...plan.config.aliases };
      if (!aliases.blocks && entries.some((entry) => !entry.path)) aliases.blocks = plan.blocksDir;
      if (!aliases.pages && entries.some((entry) => entry.path)) aliases.pages = plan.pagesDir;
      if (JSON.stringify(aliases) !== JSON.stringify(plan.config.aliases ?? {})) {
        next.aliases = aliases;
      }
    }
    const text = `${JSON.stringify(next, null, 2)}\n`;
    if (tree.readText('mimi.json') !== text) tree.overwrite('mimi.json', text);
  };
}

// ── CSS global ────────────────────────────────────────────────────────────────────────

/**
 * Agrega los `cssImports` de los ítems (p. ej. `@angular/cdk/overlay-prebuilt.css`, que pide la
 * guía del CDK) al CSS global de mimi.json, una sola vez. Van después del `@import` del tema (o
 * del de Tailwind): los `@import` tienen que ir antes que cualquier otra regla, y así quedan
 * junto a los de Mimi. Si no se encuentra el archivo, se explica cómo agregarlos a mano.
 */
function updateGlobalCss(plan: Plan): Rule {
  return (tree, context) => {
    const imports = [
      ...new Set(plan.items.flatMap((item) => registry.items[item].cssImports ?? [])),
    ];
    if (imports.length === 0) return;
    const cssPath = plan.config.tailwind?.css;
    const css = cssPath && tree.exists(cssPath) ? tree.readText(cssPath) : null;
    const missing = imports.filter((path) => !css || !hasDirective(css, '@import', path));
    if (missing.length === 0) return;
    const lines = missing.map((path) => `@import "${path}";`);
    const updated = css === null ? null : insertAfterTheme(css, lines);
    if (!cssPath || updated === null) {
      context.logger.warn(
        `No se encontró el CSS global${cssPath ? ` (${cssPath})` : ''} con el @import de ` +
          `Tailwind. Agrega a mano, después del tema de Mimi:\n${lines.map((l) => `  ${l}`).join('\n')}`,
      );
      return;
    }
    tree.overwrite(cssPath, updated);
    context.logger.info(`Agregado a ${cssPath}:`);
    for (const line of lines) context.logger.info(`  ${line}`);
  };
}

/**
 * G1: con `@import "tailwindcss" source(none)`, Tailwind no escanea la carpeta de los Blocks ni
 * la de las páginas (B.11-i), y la pantalla queda sin sus estilos. Si se copia un Block o se
 * genera una página, se agrega el `@source` de su carpeta (una vez).
 */
function addFolderSources(plan: Plan): Rule {
  return (tree, context) => {
    const dirs: string[] = [];
    if (plan.items.some((item) => registry.items[item].type === 'block' && !plan.pages[item])) {
      dirs.push(plan.blocksDir);
    }
    for (const page of Object.values(plan.pages)) {
      const dir = `${page.dir}/`.startsWith(`${plan.pagesDir}/`) ? plan.pagesDir : page.dir;
      if (!dirs.includes(dir)) dirs.push(dir);
    }
    if (dirs.length === 0) return;
    const cssPath = plan.config.tailwind?.css;
    if (!cssPath || !tree.exists(cssPath)) return;
    let css = tree.readText(cssPath);
    const lines: string[] = [];
    for (const dir of dirs) {
      const result = withFolderSource(
        css,
        cssPath,
        [plan.componentsDir, plan.blocksDir, plan.pagesDir],
        dir,
      );
      if (!result) continue;
      css = result.css;
      lines.push(result.line);
    }
    if (lines.length === 0) return;
    tree.overwrite(cssPath, css);
    context.logger.info(
      `Agregado a ${cssPath} (tu @import de Tailwind usa source(none), así que Tailwind solo ` +
        `escanea las carpetas que indicas):\n${lines.map((line) => `  ${line}`).join('\n')}`,
    );
  };
}

// ── Mensaje final ─────────────────────────────────────────────────────────────────────

/**
 * M1: un componente que se actualizó y que usa un Block instalado (en `mimi.json → blocks`) que
 * no se actualizó en esta ejecución (porque el usuario lo modificó, o porque no se pidió). Solo
 * avisa: la pantalla es del usuario y puede necesitar cambios con la API nueva.
 */
function blocksUsingUpdated(
  plan: Plan,
  report: FileReport,
  itemOf: (file: string) => string,
): string[] {
  const updated = new Set(report.updated.map(({ file }) => itemOf(file)));
  const messages: string[] = [];
  for (const block of Object.keys(plan.config.blocks ?? {}).sort()) {
    if (updated.has(block) || registry.items[block]?.type !== 'block') continue;
    const used = resolveItems(block).filter(
      (item) => updated.has(item) && registry.items[item].type === 'component',
    );
    if (used.length === 0) continue;
    const list = used.join(', ');
    messages.push(
      `Tu Block ${block} usa ${list}, que se actualizó a ${registry.version}; revisa el ` +
        'CHANGELOG por si tu pantalla necesita algún cambio.',
    );
  }
  return messages;
}

/** `pricing-01` → `Pricing01`: la clase de un Block copiado tal cual. */
const blockClassName = (item: string) =>
  item.replace(/(^|-)([a-z0-9])/g, (_, _dash, c: string) => c.toUpperCase());

function summary(plan: Plan, report: FileReport): Rule {
  return (tree, context) => {
    const log = context.logger;
    const path = (file: string) =>
      targetPathOf(file, plan.componentsDir, plan.blocksDir, plan.pages);

    if (report.created.length > 0) {
      log.info('Agregado:');
      for (const file of report.created) log.info(`  + ${path(file)}`);
    }
    if (report.overwritten.length > 0) {
      log.info('Reemplazado (--overwrite):');
      for (const file of report.overwritten) log.info(`  ~ ${path(file)}`);
      // Un Block es una pantalla del usuario: --overwrite la reemplaza entera (B.1, trampas).
      const screens = new Map<string, string>();
      for (const file of report.overwritten) {
        if (isPageFile(file)) {
          const item = pageItemOf(file);
          screens.set(item, `${plan.pages[item].dir}/`);
        } else if (isBlockFile(file)) {
          const item = file.split('/')[1];
          screens.set(item, `${plan.blocksDir}/${item}/`);
        }
      }
      for (const [block, dir] of screens) {
        log.warn(
          `--overwrite reemplazó tu pantalla ${block} (${dir}) por la de ` +
            `Mimi ${registry.version}. Si tenías cambios, recupéralos de git.`,
        );
      }
    }
    const itemOf = (file: string) =>
      [...plan.items, ...plan.implicit].find((item) =>
        itemFiles(item, plan.pages).includes(file),
      ) ?? file;
    for (const message of updatedMessages(report, itemOf, registry.version)) log.info(message);
    for (const message of blocksUsingUpdated(plan, report, itemOf)) log.warn(message);
    for (const file of report.skipped) {
      log.warn(
        `Omitido: ${path(file)} ya existe con otro contenido (usa --overwrite para reemplazarlo).`,
      );
    }
    for (const message of blockedMessages(
      report,
      plan.componentsDir,
      registry.version,
      plan.blocksDir,
      plan.pages,
    )) {
      log.warn(message);
    }
    // Una página nueva se enruta con la línea exacta (B.11-e); la CLI no edita app.routes.ts.
    // Una sección nueva va dentro de una página.
    const created = new Set(report.created);
    for (const item of plan.items) {
      if (registry.items[item].type !== 'block' || plan.legacyPages.includes(item)) continue;
      const page = plan.pages[item];
      if (page) {
        if (!created.has(routesKey(item))) continue;
        const { path: routes, appDir } = routesImportOf(page);
        const routesFile = appDir ? `${appDir}/app.routes.ts` : null;
        log.info(
          `${item} es ahora tu página ${page.name} (${page.dir}/, clase ` +
            `${pageClassName(page.name)}). Para abrirla en /${page.name}, agrega esta línea a ` +
            (routesFile && tree.exists(routesFile)
              ? `las rutas de ${routesFile}:`
              : 'tus rutas (la ruta del import es relativa a tu app.routes.ts):'),
        );
        log.info(`  ${routeLine(page, routes)}`);
        continue;
      }
      if (!registry.items[item].files.some((file) => created.has(file))) continue;
      log.info(
        `${item} es una sección (una parte de una página): ponla en una de tus páginas con ` +
          `<mimi-${item} />, importando ${blockClassName(item)} de ${plan.blocksDir}/${item}.`,
      );
    }
    // Pantallas de la 0.4.0: siguen donde estaban (B.11-g).
    for (const item of plan.legacyPages) {
      log.info(
        `${item} sigue en ${plan.blocksDir}/${item}/, donde lo instalaste con la 0.4.0, y se ` +
          `actualiza ahí. Los Blocks de pantalla se generan ahora como páginas ` +
          `(${plan.pagesDir}/${defaultPageName(item)}/, ${pageClassName(defaultPageName(item))}): ` +
          'para pasarlo, guarda tus cambios, borra esa carpeta y vuelve a ejecutar ' +
          `ng g mimi ${item}.`,
      );
    }
    if (!hasFileChanges(report) && report.skipped.length === 0 && report.blocked.length === 0) {
      log.info('Nada que hacer: los archivos ya están al día.');
    }

    const packages = Object.entries(plan.newPackages);
    if (packages.length > 0) {
      log.info('Dependencias que se instalan:');
      for (const [name, version] of packages) log.info(`  ${name}@${version}`);
    }
    if (plan.outdated.length > 0) {
      const required = [...new Set(plan.outdated.map((peer) => peer.required))].join(', ');
      const lines = plan.outdated.map(
        (peer) => `  ${peer.name}: ${SOURCE_TEXT[peer.source](peer.current)}`,
      );
      log.warn(
        `Mimi necesita @angular/cdk y @angular/aria ${required} o posterior (las anteriores ` +
          `tienen errores conocidos con sus componentes) y tu proyecto tiene:\n${lines.join('\n')}\n` +
          `Actualízalos con:\n  ng update ${plan.updatable.join(' ')}`,
      );
    }
    if (plan.missingExclusion) {
      const { cssPath, line } = plan.missingExclusion;
      log.warn(
        `Tailwind escanea ${BASE_DIR}/ (las copias originales de Mimi) y genera CSS de clases que ` +
          `quizá ya no usas. Agrega a ${cssPath}, después de @import "tailwindcss":\n  ${line}`,
      );
    }
    if (hasFileChanges(report)) {
      log.info(
        `Guarda la carpeta ${BASE_DIR.split('/')[0]}/ en git: Mimi la usa para actualizar tus ` +
          'componentes sin perder tus cambios.',
      );
    }
  };
}
