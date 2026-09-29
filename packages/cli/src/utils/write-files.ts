import { type Rule, apply, filter, forEach, mergeWith, url } from '@angular-devkit/schematics';

/** Carpeta de las copias originales, en la raíz del workspace. Debe quedar en git. */
export const BASE_DIR = '.mimi/base';

/** Qué pasó con cada archivo (rutas de las plantillas; ver projectPathOf). */
export interface FileReport {
  created: string[];
  overwritten: string[];
  /** Ya estaba igual a la plantilla. */
  unchanged: string[];
  /** Existía con otro contenido: no se tocó (ni su base). */
  skipped: string[];
}

export const emptyReport = (): FileReport => ({
  created: [],
  overwritten: [],
  unchanged: [],
  skipped: [],
});

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

/**
 * Copia archivos de las plantillas del paquete (`dist/templates`, rutas relativas a esa
 * carpeta) a `componentsDir`, revisando el árbol antes de escribir:
 *
 * - no existe → se crea;
 * - igual → no se toca;
 * - distinto → se omite (o se reemplaza con `overwrite`).
 *
 * Nunca deja que mergeWith encuentre un archivo existente, así que no puede saltar
 * "merge conflicted". Guarda la copia original en `.mimi/base/` siempre que el archivo del
 * proyecto quede igual a la plantilla; si se omitió por estar modificado, su base no cambia.
 */
export function writeTemplates(options: {
  files: Iterable<string>;
  componentsDir: string;
  overwrite: boolean;
  report: FileReport;
}): Rule {
  const files = new Set(options.files);
  return (tree) => {
    const writeBase = (file: string, content: string) => {
      const base = basePathOf(file);
      if (!tree.exists(base)) tree.create(base, content);
      else if (tree.readText(base) !== content) tree.overwrite(base, content);
    };

    return mergeWith(
      apply(url('../templates'), [
        filter((path) => files.has(path.replace(/^\//, ''))),
        forEach((entry) => {
          const file = entry.path.replace(/^\//, '');
          const target = `${options.componentsDir}/${projectPathOf(file)}`;
          const content = entry.content.toString('utf8');

          if (!tree.exists(target)) {
            tree.create(target, content);
            options.report.created.push(file);
            writeBase(file, content);
          } else if (tree.readText(target) === content) {
            options.report.unchanged.push(file);
            writeBase(file, content);
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
  };
}
