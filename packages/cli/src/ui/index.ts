import { type Rule, SchematicsException, type Tree, chain } from '@angular-devkit/schematics';
import {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  addDependency,
} from '@schematics/angular/utility';
import { normalizePath } from '../init/paths';
import { registry, resolveItems } from '../registry';
import { type MimiConfig, type PackageJson, allDependencies, readJson } from '../utils/project';
import {
  BASE_DIR,
  type FileReport,
  emptyReport,
  hasFileChanges,
  projectPathOf,
  updatedMessages,
  writeTemplates,
} from '../utils/write-files';

export interface UiOptions {
  components?: string[];
  overwrite?: boolean;
}

/** Componentes que se pueden agregar: los ítems `component` del registro. */
export const AVAILABLE = Object.entries(registry.items)
  .filter(([, item]) => item.type === 'component')
  .map(([name]) => name)
  .sort();

/** Lo que ui averigua antes de escribir nada. */
interface Plan {
  componentsDir: string;
  config: MimiConfig;
  /** Ítems a copiar: los pedidos y sus registryDependencies, sin repetir. */
  items: string[];
  /** Paquetes que se agregan a package.json (los que el proyecto no tiene). */
  newPackages: Record<string, string>;
}

/**
 * `ng g ui button input form-field`: copia los componentes y sus dependencias del registro a la
 * carpeta de mimi.json. Sin nombres, pregunta (x-prompt de selección múltiple).
 *
 * Requiere init (mimi.json). Archivos existentes: igual → nada; distinto → se omite con aviso;
 * --overwrite → se reemplaza. Guarda la copia original en .mimi/base/ y la versión de cada
 * componente en mimi.json. Instala las dependencias que falten con el gestor del proyecto.
 */
export function ui(options: UiOptions): Rule {
  return (tree: Tree): Rule => {
    const plan = inspect(tree, options);
    const report = emptyReport();
    return chain([
      writeTemplates({
        files: plan.items.flatMap((item) => registry.items[item].files),
        componentsDir: plan.componentsDir,
        overwrite: options.overwrite ?? false,
        version: registry.version,
        report,
      }),
      updateMimiConfig(plan, report),
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
      `Indica qué componentes agregar, por ejemplo: ng g ui button\nDisponibles: ${AVAILABLE.join(', ')}.`,
    );
  }
  const unknown = requested.filter((name) => !AVAILABLE.includes(name));
  if (unknown.length > 0) {
    const lines = unknown.map((name) => {
      const suggestion = closest(name);
      return `"${name}" no es un componente de Mimi.${suggestion ? ` ¿Quisiste decir ${suggestion}?` : ''}`;
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
      newPackages[name] = name.startsWith('@angular/') && angularRange ? angularRange : version;
    }
  }

  const componentsDir = normalizePath(config.aliases?.components ?? 'src/app/components/ui');
  return { componentsDir, config, items, newPackages };
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
 * alguno se omitió por estar modificado, se conserva lo que había.
 */
function updateMimiConfig(plan: Plan, report: FileReport): Rule {
  return (tree) => {
    const skipped = new Set(report.skipped);
    const components = { ...plan.config.components };
    for (const item of plan.items) {
      if (registry.items[item].type !== 'component') continue;
      if (registry.items[item].files.some((file) => skipped.has(file))) continue;
      components[item] = { version: registry.version };
    }
    const next = { ...plan.config, components };
    const text = `${JSON.stringify(next, null, 2)}\n`;
    if (tree.readText('mimi.json') !== text) tree.overwrite('mimi.json', text);
  };
}

// ── Mensaje final ─────────────────────────────────────────────────────────────────────

function summary(plan: Plan, report: FileReport): Rule {
  return (_tree, context) => {
    const log = context.logger;
    const path = (file: string) => `${plan.componentsDir}/${projectPathOf(file)}`;

    if (report.created.length > 0) {
      log.info('Agregado:');
      for (const file of report.created) log.info(`  + ${path(file)}`);
    }
    if (report.overwritten.length > 0) {
      log.info('Reemplazado (--overwrite):');
      for (const file of report.overwritten) log.info(`  ~ ${path(file)}`);
    }
    const itemOf = (file: string) =>
      plan.items.find((item) => registry.items[item].files.includes(file)) ?? file;
    for (const message of updatedMessages(report, itemOf, registry.version)) log.info(message);
    for (const file of report.skipped) {
      log.warn(
        `Omitido: ${path(file)} ya existe con otro contenido (usa --overwrite para reemplazarlo).`,
      );
    }
    if (!hasFileChanges(report) && report.skipped.length === 0) {
      log.info('Nada que hacer: los archivos ya están al día.');
    }

    const packages = Object.entries(plan.newPackages);
    if (packages.length > 0) {
      log.info('Dependencias que se instalan:');
      for (const [name, version] of packages) log.info(`  ${name}@${version}`);
    }
    if (hasFileChanges(report)) {
      log.info(
        `Guarda la carpeta ${BASE_DIR.split('/')[0]}/ en git: Mimi la usa para actualizar tus ` +
          'componentes sin perder tus cambios.',
      );
    }
  };
}
