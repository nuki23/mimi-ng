import { type Rule, SchematicsException, type Tree, chain } from '@angular-devkit/schematics';
import {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  type ProjectDefinition,
  type WorkspaceDefinition,
  addDependency,
  readWorkspace,
} from '@schematics/angular/utility';
import { JSONFile } from '@schematics/angular/utility/json-file';
import { registry, resolveItems } from '../registry';
import {
  MIMI_COLLECTION,
  type MimiConfig,
  type PackageJson,
  allDependencies,
  majorOf,
  readJson,
} from '../utils/project';
import { BASE_DIR, type FileReport, emptyReport, writeTemplates } from '../utils/write-files';
import { findTailwindImport, hasDirective, insertAfterTailwind } from './css';
import { dirnameOf, normalizePath, relativePath } from './paths';

export interface InitOptions {
  project?: string;
  icons?: boolean;
  overwrite?: boolean;
}

/** Alias que usan todos los componentes. Lo configurable es la carpeta a la que apunta. */
export const ALIAS = '@/components/ui/*';
/** Ítems del registro que copia init: el tema y las utilidades base. */
const INIT_ITEMS = ['theme', 'utils/cn', 'utils/control-styles'];
/** Paquetes que instala init (versiones del registro). */
const INIT_PACKAGES = ['clsx', 'tailwind-merge', 'class-variance-authority'];
const ICONS_PACKAGE = '@lucide/angular';
/** Colección por defecto de la CLI de Angular (ng g component, service…). */
const DEFAULT_COLLECTION = '@schematics/angular';
const MIN_ANGULAR = 22;
const MIN_TAILWIND = 4;

/** Lo que init averigua antes de escribir nada. */
interface Plan {
  projectName: string;
  cssPath: string;
  sourceNone: boolean;
  componentsDir: string;
  buildTsConfig?: string;
  mimiConfig: MimiConfig | null;
  sourceRoot: string;
}

/**
 * `ng g @mimi-ng/cli:init` (también lo ejecuta `ng add @mimi-ng/cli`).
 *
 * Primero verifica todo (Angular 22+, Tailwind 4 y su `@import`) sin tocar nada; si algo falla,
 * lanza un error claro y el proyecto queda como estaba. Después copia el tema y las utilidades,
 * importa el tema en el CSS global, agrega el alias al tsconfig, las dependencias y `mimi.json`.
 * Es idempotente: ejecutarlo dos veces no duplica nada.
 */
export function init(options: InitOptions): Rule {
  return async (tree: Tree): Promise<Rule> => {
    const plan = await inspect(tree, options);
    const report = emptyReport();
    return chain([
      writeTemplates({
        files: INIT_ITEMS.flatMap((item) => resolveItems(item)).flatMap(
          (item) => registry.items[item].files,
        ),
        componentsDir: plan.componentsDir,
        overwrite: options.overwrite ?? false,
        report,
      }),
      updateGlobalCss(plan),
      updateTsConfigs(plan),
      registerCollection(plan),
      writeMimiConfig(plan),
      ...dependencies(options.icons ?? false),
      nextSteps(plan, report, options.icons ?? false),
    ]);
  };
}

// ── Verificaciones (sin escribir) ─────────────────────────────────────────────────────

async function inspect(tree: Tree, options: InitOptions): Promise<Plan> {
  const packageJson = readJson<PackageJson>(tree, 'package.json');
  if (!packageJson) {
    throw new SchematicsException(
      'No se encontró package.json. Ejecuta init en la raíz del workspace.',
    );
  }
  const deps = allDependencies(packageJson);

  const angular = majorOf(deps['@angular/core']);
  if (angular === null) {
    throw new SchematicsException(
      'No se pudo leer la versión de @angular/core en package.json. Mimi necesita Angular 22 o superior.',
    );
  }
  if (angular < MIN_ANGULAR) {
    throw new SchematicsException(
      `Mimi necesita Angular ${MIN_ANGULAR} o superior; este proyecto usa Angular ${angular}. ` +
        'Actualízalo con "ng update @angular/core @angular/cli".',
    );
  }

  const tailwind = majorOf(deps['tailwindcss']);
  if (tailwind === null || tailwind < MIN_TAILWIND) {
    throw new SchematicsException(
      `Mimi necesita Tailwind CSS ${MIN_TAILWIND}, y ${
        tailwind === null ? 'no está instalado' : `este proyecto usa Tailwind ${tailwind}`
      }. Agrégalo con "ng add tailwindcss" o sigue la guía de Tailwind para Angular ` +
        '(https://tailwindcss.com/docs/installation/framework-guides/angular). Después vuelve a ejecutar init.',
    );
  }

  const workspace = await readWorkspace(tree);
  const { name, project } = selectProject(workspace, options.project);
  const build = project.targets.get('build');
  const styles = ((build?.options?.['styles'] as unknown[] | undefined) ?? [])
    .map((entry) => (typeof entry === 'string' ? entry : (entry as { input?: string })?.input))
    .filter((path): path is string => typeof path === 'string')
    .map(normalizePath);

  const cssFiles = styles.filter((path) => path.endsWith('.css') && tree.exists(path));
  const withTailwind = cssFiles.find((path) => findTailwindImport(tree.readText(path)));
  if (!withTailwind) {
    throw new SchematicsException(
      cssFiles.length === 0
        ? `El proyecto "${name}" no tiene un CSS global en angular.json (build → options → styles). ` +
            'Agrega uno (por ejemplo src/styles.css) con @import "tailwindcss"; y vuelve a ejecutar init.'
        : `Falta @import "tailwindcss"; en el CSS global (${cssFiles.join(', ')}). ` +
            'Agrégalo al principio del archivo y vuelve a ejecutar init.',
    );
  }

  const sourceRoot = normalizePath(project.sourceRoot ?? `${project.root}/src`);
  const mimiConfig = readJson<MimiConfig>(tree, 'mimi.json');
  const componentsDir = normalizePath(
    mimiConfig?.aliases?.components ?? `${sourceRoot}/app/components/ui`,
  );
  const tsConfig = build?.options?.['tsConfig'];

  return {
    projectName: name,
    cssPath: withTailwind,
    sourceNone: findTailwindImport(tree.readText(withTailwind))!.sourceNone,
    componentsDir,
    buildTsConfig: typeof tsConfig === 'string' ? normalizePath(tsConfig) : undefined,
    mimiConfig,
    sourceRoot,
  };
}

function selectProject(
  workspace: WorkspaceDefinition,
  requested: string | undefined,
): { name: string; project: ProjectDefinition } {
  if (requested) {
    const project = workspace.projects.get(requested);
    if (!project) {
      throw new SchematicsException(`El proyecto "${requested}" no existe en angular.json.`);
    }
    return { name: requested, project };
  }
  const apps = [...workspace.projects].filter(
    ([, project]) => project.extensions['projectType'] === 'application',
  );
  if (apps.length === 1) return { name: apps[0][0], project: apps[0][1] };
  if (apps.length === 0) {
    throw new SchematicsException('No hay ninguna aplicación en angular.json.');
  }
  throw new SchematicsException(
    `Hay varias aplicaciones (${apps.map(([n]) => n).join(', ')}). ` +
      'Elige una con --project, por ejemplo: ng add @mimi-ng/cli --project=' +
      apps[0][0],
  );
}

// ── CSS global ────────────────────────────────────────────────────────────────────────

function updateGlobalCss(plan: Plan): Rule {
  return (tree, context) => {
    const cssDir = dirnameOf(plan.cssPath);
    const themePath = `${relativePath(cssDir, plan.componentsDir)}/theme/theme-base.css`;
    const sourcePath = relativePath(cssDir, plan.componentsDir);
    let css = tree.readText(plan.cssPath);
    const lines: string[] = [];

    if (!hasDirective(css, '@import', themePath)) lines.push(`@import "${themePath}";`);
    if (plan.sourceNone && !hasDirective(css, '@source', sourcePath)) {
      lines.push(`@source "${sourcePath}";`);
      context.logger.warn(
        `El @import de Tailwind en ${plan.cssPath} usa source(none): Tailwind no escanea nada por su ` +
          `cuenta. Se agregó @source "${sourcePath}"; para que genere las clases de los componentes.`,
      );
    }
    if (lines.length === 0) return;
    css = insertAfterTailwind(css, lines);
    tree.overwrite(plan.cssPath, css);
  };
}

// ── tsconfig ──────────────────────────────────────────────────────────────────────────

/**
 * El alias va en tsconfig.json (editor, pruebas). Si el tsconfig del build define su propio
 * compilerOptions.paths, ese reemplaza al de la raíz, así que también va ahí. JSONFile conserva
 * los comentarios (el tsconfig de Angular es JSONC).
 */
function updateTsConfigs(plan: Plan): Rule {
  return (tree, context) => {
    const targets = ['tsconfig.json'];
    if (
      plan.buildTsConfig &&
      plan.buildTsConfig !== 'tsconfig.json' &&
      tree.exists(plan.buildTsConfig)
    ) {
      const own = new JSONFile(tree, plan.buildTsConfig).get(['compilerOptions', 'paths']);
      if (own !== undefined) targets.push(plan.buildTsConfig);
    }
    for (const path of targets) {
      if (!tree.exists(path)) {
        context.logger.warn(`No se encontró ${path}: agrega el alias ${ALIAS} a mano.`);
        continue;
      }
      const file = new JSONFile(tree, path);
      const value = `${relativePath(dirnameOf(path), plan.componentsDir)}/*`;
      const current = file.get(['compilerOptions', 'paths', ALIAS]);
      if (current === undefined) {
        file.modify(['compilerOptions', 'paths', ALIAS], [value]);
      } else if (!sameAlias(current, value)) {
        context.logger.warn(
          `${path} ya tiene el alias ${ALIAS} con otro valor (${JSON.stringify(current)}); no se ` +
            `cambió. Mimi espera ["${value}"].`,
        );
      }
    }
  };
}

function sameAlias(current: unknown, value: string): boolean {
  return (
    Array.isArray(current) &&
    current.length === 1 &&
    typeof current[0] === 'string' &&
    normalizePath(current[0]) === normalizePath(value)
  );
}

// ── schematicCollections (tarea 3.6) ─────────────────────────────────────────────────

/**
 * Registra la colección para que funcione `ng g ui button`. `cli.schematicCollections`
 * reemplaza al valor por defecto de la CLI de Angular, así que si no existe se crea con
 * `@schematics/angular` primero (si no, el usuario perdería `ng g component`). Si ya existe,
 * Mimi se agrega al final sin quitar nada. El de un proyecto gana al del workspace, así que si
 * el proyecto tiene el suyo, también va ahí.
 */
function registerCollection(plan: Plan): Rule {
  return (tree) => {
    if (!tree.exists('angular.json')) return;
    const file = new JSONFile(tree, 'angular.json');
    const add = (path: (string | number)[], createIfMissing: boolean) => {
      const current = file.get(path);
      if (current === undefined) {
        if (createIfMissing) file.modify(path, [DEFAULT_COLLECTION, MIMI_COLLECTION]);
      } else if (Array.isArray(current) && !current.includes(MIMI_COLLECTION)) {
        file.modify(path, [...(current as string[]), MIMI_COLLECTION]);
      }
    };
    add(['cli', 'schematicCollections'], true);
    add(['projects', plan.projectName, 'cli', 'schematicCollections'], false);
  };
}

// ── mimi.json ─────────────────────────────────────────────────────────────────────────

function writeMimiConfig(plan: Plan): Rule {
  return (tree) => {
    if (plan.mimiConfig) return;
    const config: MimiConfig = {
      style: 'vivid',
      tailwind: { css: plan.cssPath },
      aliases: {
        components: plan.componentsDir,
        utils: `${plan.componentsDir}/utils`,
        theme: `${plan.sourceRoot}/app/mimi.preset.ts`,
      },
      components: {},
    };
    tree.create('mimi.json', `${JSON.stringify(config, null, 2)}\n`);
  };
}

// ── Dependencias ──────────────────────────────────────────────────────────────────────

/** Versión de un paquete según el registro (la de ui-core). */
function registryVersion(name: string): string {
  for (const item of Object.values(registry.items)) {
    const version = item.dependencies?.[name];
    if (version) return version;
  }
  const suggested = registry.suggestedDependencies?.[name];
  if (suggested) return suggested;
  throw new SchematicsException(`El registro de Mimi no tiene versión para ${name}.`);
}

/**
 * Agrega las dependencias (si ya están, se dejan como estén) y agenda la instalación.
 * `ng add` / `ng g` la ejecutan con el gestor de paquetes que detecta la CLI de Angular
 * por el lockfile del proyecto.
 */
function dependencies(icons: boolean): Rule[] {
  const names = icons ? [...INIT_PACKAGES, ICONS_PACKAGE] : INIT_PACKAGES;
  return names.map((name) =>
    addDependency(name, registryVersion(name), {
      type: DependencyType.Default,
      existing: ExistingBehavior.Skip,
      install: InstallBehavior.Auto,
    }),
  );
}

// ── Mensaje final ─────────────────────────────────────────────────────────────────────

function nextSteps(plan: Plan, report: FileReport, icons: boolean): Rule {
  return (_tree, context) => {
    for (const file of report.skipped) {
      context.logger.warn(
        `Omitido: ${plan.componentsDir}/${file} ya existe con otro contenido ` +
          '(usa --overwrite para reemplazarlo).',
      );
    }
    for (const file of report.overwritten) {
      context.logger.info(`Reemplazado: ${plan.componentsDir}/${file}`);
    }
    context.logger.info('');
    context.logger.info(`Mimi quedó configurado en "${plan.projectName}":`);
    context.logger.info(`  · Tema y utilidades en ${plan.componentsDir}`);
    context.logger.info(`  · Tema importado en ${plan.cssPath}`);
    context.logger.info(`  · Alias ${ALIAS} en el tsconfig`);
    context.logger.info(`  · Configuración en mimi.json y copias originales en ${BASE_DIR}/`);
    context.logger.info(`  · ${MIMI_COLLECTION} en schematicCollections de angular.json`);
    if (icons) context.logger.info(`  · ${ICONS_PACKAGE} para tus íconos`);
    context.logger.info('');
    context.logger.info('Agrega tu primer componente:');
    context.logger.info('  ng g ui button');
    context.logger.info('');
    context.logger.info(`Y úsalo: import { MimiButton } from '@/components/ui/button';`);
    context.logger.info(
      'Guarda la carpeta .mimi/ en git: Mimi la usa para actualizar tus componentes sin perder tus cambios.',
    );
  };
}
