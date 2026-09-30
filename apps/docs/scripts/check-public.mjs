// Revisa que apps/docs/public solo tenga los tipos de archivo esperados. Todo lo que está ahí se
// publica tal cual en ng.mimiworks.dev, así que un documento que caiga ahí por error no debe
// llegar al sitio. Corre dentro de `pnpm build:docs` (el build de Cloudflare) y en las pruebas
// (apps/docs/src/app/public-files.spec.ts).
//
// Uso: node apps/docs/scripts/check-public.mjs [carpeta]   (por defecto, apps/docs/public)
import { readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Extensiones permitidas (imágenes del sitio). */
const EXTENSIONS = new Set(['.svg', '.png', '.ico', '.webp']);
/** Archivos de configuración de Cloudflare permitidos por nombre exacto. */
const NAMES = new Set(['_headers']);

const root = resolve(
  process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
);

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

const rejected = files(root).filter((file) => {
  const name = basename(file);
  return !NAMES.has(name) && !EXTENSIONS.has(extname(name).toLowerCase());
});

if (rejected.length > 0) {
  const list = rejected.map((file) => `  - ${relative(root, file).split(sep).join('/')}`);
  console.error(
    `apps/docs/public tiene archivos que no se deben publicar:\n${list.join('\n')}\n` +
      `Permitidos: ${[...EXTENSIONS].join(', ')} y ${[...NAMES].join(', ')}. ` +
      'Si es un tipo nuevo a propósito, agrégalo en apps/docs/scripts/check-public.mjs.',
  );
  process.exit(1);
}
