/**
 * Rutas del workspace siempre con "/", también en Windows: el árbol de schematics usa rutas
 * POSIX, y lo que escribimos en el CSS y en el tsconfig debe funcionar en cualquier sistema.
 * Sin `node:path`, para no depender de sus tipos.
 */

/** `src\app\ui\`, `./src/app/ui` o `/src/app/ui` → `src/app/ui`. Resuelve `.` y `..`. */
export function normalizePath(path: string): string {
  const out: string[] = [];
  for (const part of path.replace(/\\/g, '/').split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..' && out.length > 0 && out[out.length - 1] !== '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

/** Carpeta de un archivo: `src/styles.css` → `src`. */
export function dirnameOf(path: string): string {
  const parts = normalizePath(path).split('/');
  parts.pop();
  return parts.join('/');
}

/** Ruta relativa de la carpeta `fromDir` a `to`, siempre con "./" o "../" al principio. */
export function relativePath(fromDir: string, to: string): string {
  const from = normalizePath(fromDir).split('/').filter(Boolean);
  const target = normalizePath(to).split('/').filter(Boolean);
  let common = 0;
  while (common < from.length && common < target.length && from[common] === target[common]) {
    common++;
  }
  const up = from.slice(common).map(() => '..');
  const rel = [...up, ...target.slice(common)].join('/');
  if (rel === '') return '.';
  return rel.startsWith('..') ? rel : `./${rel}`;
}
