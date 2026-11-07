import { type Rule, SchematicsException, type Tree, chain } from '@angular-devkit/schematics';
import {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  addDependency,
} from '@schematics/angular/utility';
import { hasDirective, insertAfterTheme } from '../init/css';
import { INIT_ITEMS } from '../init/items';
import { normalizePath } from '../init/paths';
import { registry, resolveItems } from '../registry';
import {
  type MimiConfig,
  type PackageJson,
  allDependencies,
  defaultBlocksDir,
  readJson,
} from '../utils/project';
import {
  mimiSourceNotLine,
  missingMimiExclusion,
  tailwindSupportsSourceNot,
  withBlocksSource,
} from '../utils/tailwind';
import {
  BASE_DIR,
  type FileReport,
  blockedMessages,
  emptyReport,
  hasFileChanges,
  isBlockFile,
  targetPathOf,
  updatedMessages,
  writeTemplates,
} from '../utils/write-files';

export interface UiOptions {
  components?: string[];
  overwrite?: boolean;
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
        overwrite: options.overwrite ?? false,
        version: registry.version,
        report,
      }),
      updateMimiConfig(plan, report),
      updateGlobalCss(plan),
      addBlocksSource(plan),
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
  const outdated = outdatedPeers(tree, items, installed, newPackages);
  const updatable = PEERS_WITH_MINIMUM.filter((name) => installed[name] || newPackages[name]);
  const missingExclusion = mimiExclusion(tree, config, installed);
  return {
    componentsDir,
    blocksDir,
    config,
    items,
    implicit,
    newPackages,
    outdated,
    updatable,
    missingExclusion,
  };
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
      const { type, files } = registry.items[item];
      if (type !== 'component' && type !== 'block') continue;
      if (blocked.has(item)) continue;
      if (files.some((file) => skipped.has(file))) continue;
      (type === 'block' ? blocks : components)[item] = { version: registry.version };
    }
    const next: MimiConfig = { ...plan.config, components };
    if (Object.keys(blocks).length > 0) {
      next.blocks = blocks;
      // Proyectos de la 0.3.0 o anteriores: la carpeta queda escrita la primera vez (B.1-a).
      if (!plan.config.aliases?.blocks) {
        next.aliases = { ...plan.config.aliases, blocks: plan.blocksDir };
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
 * G1: con `@import "tailwindcss" source(none)`, Tailwind no escanea la carpeta de los Blocks y
 * la pantalla queda sin sus estilos. Si se copia un Block, se agrega su `@source` (una vez).
 */
function addBlocksSource(plan: Plan): Rule {
  return (tree, context) => {
    if (!plan.items.some((item) => registry.items[item].type === 'block')) return;
    const cssPath = plan.config.tailwind?.css;
    if (!cssPath || !tree.exists(cssPath)) return;
    const result = withBlocksSource(
      tree.readText(cssPath),
      cssPath,
      plan.componentsDir,
      plan.blocksDir,
    );
    if (!result) return;
    tree.overwrite(cssPath, result.css);
    context.logger.info(
      `Agregado a ${cssPath} (tu @import de Tailwind usa source(none), así que Tailwind solo ` +
        `escanea las carpetas que indicas):\n  ${result.line}`,
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

/**
 * Cómo se importa un Block desde `app.routes.ts` (en `src/app/`): `src/app/blocks` →
 * `./blocks/login-01`. Si la carpeta no está dentro de `app/`, la ruta del workspace.
 */
function routesImport(blocksDir: string, item: string): string {
  const at = `/${blocksDir}`.lastIndexOf('/app/');
  return at >= 0 ? `./${`/${blocksDir}`.slice(at + 5)}/${item}` : `${blocksDir}/${item}`;
}

function summary(plan: Plan, report: FileReport): Rule {
  return (_tree, context) => {
    const log = context.logger;
    const path = (file: string) => targetPathOf(file, plan.componentsDir, plan.blocksDir);

    if (report.created.length > 0) {
      log.info('Agregado:');
      for (const file of report.created) log.info(`  + ${path(file)}`);
    }
    if (report.overwritten.length > 0) {
      log.info('Reemplazado (--overwrite):');
      for (const file of report.overwritten) log.info(`  ~ ${path(file)}`);
      // Un Block es una pantalla del usuario: --overwrite la reemplaza entera (B.1, trampas).
      const screens = [
        ...new Set(report.overwritten.filter(isBlockFile).map((file) => file.split('/')[1])),
      ];
      for (const block of screens) {
        log.warn(
          `--overwrite reemplazó tu pantalla ${block} (${plan.blocksDir}/${block}/) por la de ` +
            `Mimi ${registry.version}. Si tenías cambios, recupéralos de git.`,
        );
      }
    }
    const itemOf = (file: string) =>
      [...plan.items, ...plan.implicit].find((item) => registry.items[item].files.includes(file)) ??
      file;
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
    )) {
      log.warn(message);
    }
    // Un Block nuevo es una página: se enruta (B.1, «API pública»).
    const created = new Set(report.created);
    for (const item of plan.items) {
      const { type, files } = registry.items[item];
      if (type !== 'block' || !files.some((file) => created.has(file))) continue;
      const className = item.replace(/(^|-)([a-z0-9])/g, (_, _dash, c: string) => c.toUpperCase());
      log.info(
        `${item} es una pantalla: agrégala a tus rutas, por ejemplo ` +
          `{ path: '${item.split('-')[0]}', component: ${className} } ` +
          `(import { ${className} } from '${routesImport(plan.blocksDir, item)}').`,
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
