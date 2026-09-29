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
  /** Modificado por el usuario (distinto de su base, o sin base): no se tocó, ni su base. */
  skipped: string[];
}

export const emptyReport = (): FileReport => ({
  created: [],
  overwritten: [],
  updated: [],
  unchanged: [],
  skipped: [],
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
 * Copia archivos de las plantillas del paquete (`dist/templates`, rutas relativas a esa
 * carpeta) a `componentsDir`, revisando el árbol antes de escribir. Si el archivo ya existe:
 *
 * - igual a la plantilla → al día;
 * - igual a su base en `.mimi/base/` → el usuario no lo tocó. Si la base es de esta versión,
 *   la diferencia con la plantilla es solo de formato (la CLI de Angular pasa el Prettier del
 *   proyecto por lo que escriben los schematics): al día. Si es de una versión anterior, se
 *   actualiza;
 * - distinto de su base, o sin base → modificado por el usuario: se omite (o se reemplaza con
 *   `overwrite`).
 *
 * Nunca deja que mergeWith encuentre un archivo existente ("merge conflicted"). Guarda la base
 * y su versión en `.mimi/manifest.json` siempre que el archivo quede igual a la plantilla; si se
 * omitió por estar modificado, su base no cambia.
 */
export function writeTemplates(options: {
  files: Iterable<string>;
  componentsDir: string;
  overwrite: boolean;
  version: string;
  report: FileReport;
}): Rule {
  const files = new Set(options.files);
  return (tree) => {
    const manifest = readManifest(tree);
    let manifestChanged = false;

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

    const copy = mergeWith(
      apply(url('../templates'), [
        filter((path) => files.has(path.replace(/^\//, ''))),
        forEach((entry) => {
          const file = entry.path.replace(/^\//, '');
          const target = `${options.componentsDir}/${projectPathOf(file)}`;
          const base = basePathOf(file);
          const content = entry.content.toString('utf8');

          if (!tree.exists(target)) {
            tree.create(target, content);
            options.report.created.push(file);
            writeBase(file, content);
            return null;
          }
          const current = tree.readText(target);
          if (current === content) {
            options.report.unchanged.push(file);
            writeBase(file, content);
          } else if (tree.exists(base) && tree.readText(base) === current) {
            const from = manifest.files[projectPathOf(file)] ?? null;
            if (from === options.version) {
              // Mismo contenido que escribió Mimi, solo con otro formato.
              options.report.unchanged.push(file);
            } else {
              tree.overwrite(target, content);
              options.report.updated.push({ file, from });
              writeBase(file, content);
            }
          } else if (options.overwrite) {
            tree.overwrite(target, content);
            options.report.overwritten.push(file);
            writeBase(file, content);
          } else {
            options.report.skipped.push(file);
          }
          // Todo se escribe arriba, en el árbol del proyecto: nada llega a mergeWith.
          return null;
        }),
      ]),
    );

    const saveManifest: Rule = (t) => {
      if (!manifestChanged) return;
      const sorted = Object.fromEntries(Object.entries(manifest.files).sort());
      const text = `${JSON.stringify({ files: sorted }, null, 2)}\n`;
      if (t.exists(MANIFEST)) t.overwrite(MANIFEST, text);
      else t.create(MANIFEST, text);
    };

    return chain([copy, saveManifest]);
  };
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
