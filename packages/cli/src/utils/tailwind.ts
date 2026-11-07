import type { Tree } from '@angular-devkit/schematics';
import { findTailwindImport, hasDirective, insertAfterTheme } from '../init/css';
import { dirnameOf, relativePath } from '../init/paths';

/** La carpeta de las copias originales (`.mimi/base/`), en la raíz del workspace. */
const MIMI_DIR = '.mimi';

/**
 * ¿El Tailwind del proyecto entiende `@source not` (4.1 o superior)? Manda la versión instalada
 * (`node_modules`, la que corre de verdad); si no está instalado, el rango de package.json: solo
 * un rango que no puede pasar de la 4.0 (`4.0.5`, `~4.0.17`) cuenta como 4.0. `^4.0.17` instala
 * la última 4.x, así que sí lo entiende.
 */
export function tailwindSupportsSourceNot(tree: Tree, declared: string | undefined): boolean {
  const file = tree.read('node_modules/tailwindcss/package.json');
  const installed = file
    ? (JSON.parse(file.toString('utf-8')) as { version?: string }).version
    : undefined;
  if (installed) return atLeast41(installed);
  if (!declared) return true;
  // Solo un rango exacto o con `~` fija el minor; `^4.0.17`, `>=4`, `^4`, `latest`: la última 4.x.
  const match = /^\s*(?:~|=|v)?\s*(\d+)\.(\d+)/.exec(declared);
  if (!match) return true;
  const [major, minor] = [Number(match[1]), Number(match[2])];
  return major > 4 || (major === 4 && minor >= 1);
}

function atLeast41(version: string): boolean {
  const [major, minor] = version.split('.').map((n) => Number.parseInt(n, 10) || 0);
  return major > 4 || (major === 4 && minor >= 1);
}

/**
 * Con `source(none)`, Tailwind solo escanea lo que dice un `@source`: la carpeta de los Blocks
 * (G1) y la de las páginas (B.11) necesitan el suyo, como la de componentes. Devuelve el CSS con
 * la línea agregada (después del último `@source` de `afterDirs` que esté, o del tema), o `null`
 * si no hace falta: sin `source(none)`, o si ya está (comillas simples o dobles).
 */
export function withFolderSource(
  css: string,
  cssPath: string,
  afterDirs: string[],
  dir: string,
): { css: string; line: string } | null {
  const tailwind = findTailwindImport(css);
  if (!tailwind?.sourceNone) return null;
  const cssDir = dirnameOf(cssPath);
  const path = relativePath(cssDir, dir);
  if (hasDirective(css, '@source', path)) return null;
  const line = `@source "${path}";`;
  let end = -1;
  for (const after of afterDirs) {
    const match = new RegExp(
      String.raw`^[ \t]*@source\s+(["'])` +
        relativePath(cssDir, after).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
        String.raw`\1[^;\n]*;[^\n]*$`,
      'm',
    ).exec(css);
    if (match) end = Math.max(end, match.index + match[0].length);
  }
  if (end >= 0) {
    const eol = /\r\n/.test(css) ? '\r\n' : '\n';
    return { css: css.slice(0, end) + eol + line + css.slice(end), line };
  }
  const updated = insertAfterTheme(css, [line]);
  return updated === null ? null : { css: updated, line };
}

/** La línea que excluye `.mimi/` del escaneo de Tailwind, relativa al CSS global. */
export function mimiSourceNotLine(cssPath: string): string {
  return `@source not "${mimiSourceNotPath(cssPath)}";`;
}

export function mimiSourceNotPath(cssPath: string): string {
  return relativePath(dirnameOf(cssPath), MIMI_DIR);
}

/**
 * ¿Falta la exclusión de `.mimi/` en este CSS? No hace falta con `source(none)` (Tailwind no
 * escanea nada por su cuenta) ni si ya está, con comillas simples o dobles.
 */
export function missingMimiExclusion(css: string, cssPath: string): boolean {
  const tailwind = findTailwindImport(css);
  if (!tailwind || tailwind.sourceNone) return false;
  return !hasDirective(css, '@source not', mimiSourceNotPath(cssPath));
}
