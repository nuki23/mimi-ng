import {
  type Rule,
  type Tree,
  apply,
  chain,
  filter,
  forEach,
  mergeWith,
  url,
} from '@angular-devkit/schematics';
import { registry, resolveItems } from '../registry';

/** Carpeta de las copias originales, en la raíz del workspace. Debe quedar en git. */
export const BASE_DIR = '.mimi/base';

/** Versión de Mimi con la que se escribió la base de cada archivo. */
export const MANIFEST = '.mimi/manifest.json';

interface Manifest {
  files: Record<string, string>;
}

/** Qué pasó con cada archivo (rutas de las plantillas; ver projectPathOf). */
export interface FileReport {
  created: string[];
  overwritten: string[];
  /** Igual a su base (el usuario no lo tocó) y de una versión anterior: se actualizó. */
  updated: { file: string; from: string | null }[];
  /** Ya estaba al día (igual a la plantilla, o igual a su base en la misma versión). */
  unchanged: string[];
  /**
   * Modificado por el usuario sobre la versión actual (o sin base: un archivo suyo que ya
   * estaba): no se tocó, ni su base. El resto de su ítem sí se escribe: no mezcla versiones.
   */
  skipped: string[];
  /** Ítems que no se escribieron (ninguno de sus archivos), con el motivo. */
  blocked: BlockedItem[];
}

/**
 * Un ítem que no se escribió para no mezclar versiones: o el usuario modificó alguno de sus
 * archivos de una versión anterior (`files`), o depende de un ítem que quedó así (`dependency`).
 */
export interface BlockedItem {
  item: string;
  /** Archivos modificados por el usuario (vacío si lo bloquea una dependencia). */
  files: string[];
  /** El ítem bloqueado del que depende. */
  dependency?: string;
  /** Ya estaba en el proyecto (se habría actualizado) o se habría agregado. */
  installed: boolean;
}

export const emptyReport = (): FileReport => ({
  created: [],
  overwritten: [],
  updated: [],
  unchanged: [],
  skipped: [],
  blocked: [],
});

/** ¿El reporte tiene cambios en archivos del proyecto? */
export const hasFileChanges = (report: FileReport) =>
  report.created.length + report.overwritten.length + report.updated.length > 0;

/**
 * Ruta de un archivo de las plantillas dentro de la carpeta de componentes del proyecto. Los
 * componentes pierden `components/` para que `@/components/ui/button` apunte a
 * `<carpeta>/button` (`components/button/button.ts` → `button/button.ts`); utils y tema
 * conservan su carpeta (`utils/cn.ts`, `theme/theme-base.css`).
 */
export function projectPathOf(file: string): string {
  return file.replace(/^components\//, '');
}

/** Copia original en .mimi/base, con la misma estructura (`.mimi/base/button/button.ts`). */
export function basePathOf(file: string): string {
  return `${BASE_DIR}/${projectPathOf(file)}`;
}

function readManifest(tree: Tree): Manifest {
  if (!tree.exists(MANIFEST)) return { files: {} };
  try {
    const parsed = JSON.parse(tree.readText(MANIFEST)) as Partial<Manifest>;
    return { files: { ...parsed.files } };
  } catch {
    return { files: {} };
  }
}

/**
 * Estado de un archivo antes de escribir:
 *
 * - `new`: no existe;
 * - `same`: igual a la plantilla;
 * - `formatted`: igual a su base de esta versión (la diferencia con la plantilla es solo de
 *   formato: la CLI de Angular pasa el Prettier del proyecto por lo que escriben los schematics);
 * - `old`: igual a su base de una versión anterior (el usuario no lo tocó): se actualiza;
 * - `modifiedOld`: distinto de su base, que es de una versión anterior: el usuario modificó una
 *   versión vieja. Bloquea su ítem;
 * - `modified`: distinto de su base de esta versión, o sin base (un archivo suyo que ya estaba):
 *   se conserva, sin bloquear nada.
 */
type FileState = 'new' | 'same' | 'formatted' | 'old' | 'modifiedOld' | 'modified';

/**
 * Copia los archivos de los ítems del registro desde las plantillas del paquete
 * (`dist/templates`) a `componentsDir`. **Todo o nada por ítem:** primero revisa cada archivo
 * (ver `FileState`) y después decide por ítem:
 *
 * - si el usuario modificó alguno de sus archivos de una versión anterior, no se escribe
 *   ninguno (ni los nuevos ni los que no tocó): mezclar versiones rompe la compilación;
 * - lo mismo si depende (por `registryDependencies`, en cualquier nivel) de un ítem que quedó
 *   así, esté instalado o no;
 * - si no, se crean los que faltan y se actualizan los que el usuario no tocó. Los modificados
 *   sobre esta versión se conservan (`skipped`).
 *
 * Con `overwrite`, todo se reemplaza y nada se bloquea. Los ítems `implicit` (el tema y lo que
 * copia init, que `ng g mimi` revisa aunque no se pidan) solo se escriben si hay que
 * actualizarlos: un cambio del usuario sobre la versión actual se respeta en silencio, también
 * con `overwrite`, y no bloquean a otros ítems.
 *
 * Nunca deja que mergeWith encuentre un archivo existente ("merge conflicted"). Guarda la base y
 * su versión en `.mimi/manifest.json` siempre que el archivo quede igual a la plantilla; los de un
 * ítem bloqueado o conservado no cambian su base.
 */
export function writeTemplates(options: {
  items: string[];
  implicit?: Iterable<string>;
  componentsDir: string;
  overwrite: boolean;
  version: string;
  report: FileReport;
}): Rule {
  const items = [...new Set(options.items)];
  const implicit = new Set(options.implicit ?? []);
  const files = new Set(items.flatMap((item) => registry.items[item].files));
  const contents = new Map<string, string>();

  // 1. Lee las plantillas (sin escribir nada: forEach devuelve null).
  const read = mergeWith(
    apply(url('../templates'), [
      filter((path) => files.has(path.replace(/^\//, ''))),
      forEach((entry) => {
        contents.set(entry.path.replace(/^\//, ''), entry.content.toString('utf8'));
        return null;
      }),
    ]),
  );

  // 2. Decide por ítem y escribe.
  const write: Rule = (tree) => {
    const manifest = readManifest(tree);
    let manifestChanged = false;
    const targetOf = (file: string) => `${options.componentsDir}/${projectPathOf(file)}`;

    const stateOf = (file: string): { state: FileState; from: string | null } => {
      const target = targetOf(file);
      if (!tree.exists(target)) return { state: 'new', from: null };
      const current = tree.readText(target);
      if (current === contents.get(file)) return { state: 'same', from: null };
      const from = manifest.files[projectPathOf(file)] ?? null;
      const base = basePathOf(file);
      if (tree.exists(base)) {
        if (tree.readText(base) === current) {
          return { state: from === options.version ? 'formatted' : 'old', from };
        }
        if (from !== null && from !== options.version) return { state: 'modifiedOld', from };
      }
      return { state: 'modified', from };
    };

    const states = new Map(
      items.map((item) => [
        item,
        registry.items[item].files
          .filter((file) => contents.has(file))
          .map((file) => ({ file, ...stateOf(file) })),
      ]),
    );

    // Bloqueados por un cambio propio y, después, por una dependencia bloqueada.
    const blocked = new Map<string, BlockedItem>();
    if (!options.overwrite) {
      for (const item of items) {
        const modified = states.get(item)!.filter((s) => s.state === 'modifiedOld');
        if (modified.length > 0) {
          blocked.set(item, {
            item,
            files: modified.map((s) => s.file),
            installed: true,
          });
        }
      }
      for (const item of items) {
        if (blocked.has(item)) continue;
        const dependency = resolveItems(item)
          .filter((dep) => dep !== item)
          .find((dep) => blocked.has(dep) && blocked.get(dep)!.files.length > 0);
        if (dependency) {
          blocked.set(item, {
            item,
            files: [],
            dependency,
            installed: states.get(item)!.some((s) => s.state !== 'new'),
          });
        }
      }
    }

    const writeBase = (file: string, content: string) => {
      const base = basePathOf(file);
      if (!tree.exists(base)) tree.create(base, content);
      else if (tree.readText(base) !== content) tree.overwrite(base, content);
      const key = projectPathOf(file);
      if (manifest.files[key] !== options.version) {
        manifest.files[key] = options.version;
        manifestChanged = true;
      }
    };

    for (const item of items) {
      if (blocked.has(item)) {
        options.report.blocked.push(blocked.get(item)!);
        continue;
      }
      for (const { file, state, from } of states.get(item)!) {
        const content = contents.get(file)!;
        const target = targetOf(file);
        switch (state) {
          case 'new':
            tree.create(target, content);
            options.report.created.push(file);
            writeBase(file, content);
            break;
          case 'same':
            options.report.unchanged.push(file);
            writeBase(file, content);
            break;
          case 'formatted':
            options.report.unchanged.push(file);
            break;
          case 'old':
            tree.overwrite(target, content);
            options.report.updated.push({ file, from });
            writeBase(file, content);
            break;
          case 'modifiedOld':
          case 'modified':
            // Un cambio sobre la versión actual de un ítem implícito se respeta siempre.
            if (options.overwrite && !(implicit.has(item) && state === 'modified')) {
              tree.overwrite(target, content);
              options.report.overwritten.push(file);
              writeBase(file, content);
            } else if (!implicit.has(item)) {
              options.report.skipped.push(file);
            }
            break;
        }
      }
    }

    if (manifestChanged) {
      const sorted = Object.fromEntries(Object.entries(manifest.files).sort());
      const text = `${JSON.stringify({ files: sorted }, null, 2)}\n`;
      if (tree.exists(MANIFEST)) tree.overwrite(MANIFEST, text);
      else tree.create(MANIFEST, text);
    }
  };

  return chain([read, write]);
}

/**
 * Los avisos de los ítems que no se escribieron (`report.blocked`): qué no se actualizó, por qué
 * y qué hacer. Nunca dicen «actualizado».
 */
export function blockedMessages(
  report: FileReport,
  componentsDir: string,
  version: string,
): string[] {
  const path = (file: string) => `${componentsDir}/${projectPathOf(file)}`;
  return report.blocked.map(({ item, files, dependency, installed }) => {
    if (dependency) {
      const needs = `necesita ${dependency} ${version}, que no se actualizó (ver el aviso de ${dependency}).`;
      return installed
        ? `${item} no se actualizó a ${version}: ${needs}`
        : `${item} no se agregó: ${needs}`;
    }
    const isTheme = registry.items[item]?.type === 'theme';
    const label = isTheme ? 'El tema' : item;
    const dir = projectPathOf(files[0]).split('/').slice(0, -1).join('/');
    return (
      `${label} no se actualizó a ${version} porque modificaste ${files.map(path).join(', ')}. ` +
      'No se cambió ninguno de sus archivos, para no mezclar versiones.' +
      (isTheme
        ? ` Los componentes de la ${version} usan tokens nuevos del tema: sin ellos, algunos estilos no se generan.`
        : '') +
      ' Para actualizarlo: guarda tus cambios (por ejemplo, en git), vuelve a ejecutar el ' +
      'comando con --overwrite y aplícalos de nuevo. La versión de Mimi que modificaste está en ' +
      `${BASE_DIR}/${dir}/, para comparar.`
    );
  });
}

/** Compara versiones `x.y.z` numéricamente (`0.10.0` > `0.9.0`). `null` es la más vieja. */
export function compareVersions(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  const pa = a.split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
  const pb = b.split(/[.-]/).map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * «button actualizado de 0.1.0 a 0.2.0», uno por ítem (con la versión más vieja de sus
 * archivos). `itemOf` dice a qué ítem del registro pertenece cada archivo.
 */
export function updatedMessages(
  report: FileReport,
  itemOf: (file: string) => string,
  version: string,
): string[] {
  const oldest = new Map<string, string | null>();
  for (const { file, from } of report.updated) {
    const item = itemOf(file);
    const previous = oldest.get(item);
    if (!oldest.has(item) || compareVersions(from, previous ?? null) < 0) oldest.set(item, from);
  }
  return [...oldest].map(
    ([item, from]) => `${item} actualizado de ${from ?? 'una versión anterior'} a ${version}`,
  );
}
