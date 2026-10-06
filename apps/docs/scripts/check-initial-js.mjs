// Presupuesto del JS inicial del showcase (spec 10). Los budgets de Angular no tienen un tipo
// «JS inicial»: `initial` suma también el CSS global, que crece con cada componente, y `bundle`
// solo mide archivos con nombre, pero el chunk compartido inicial no lo tiene. Este script suma lo
// que index.html carga al inicio (el <script type="module"> y los <link rel="modulepreload">),
// avisa a partir de 325 kB y falla a partir de 335 kB (tamaño crudo, como los budgets de
// Angular). Informa crudo, gzip y brotli, y también el CSS global, sin
// umbrales (lo vigila el budget `bundle styles` de angular.json). Tamaños en kB de 1000 bytes,
// como el build de Angular.
//
// Corre después de `ng build docs` en `pnpm build:docs` (y por eso en `pnpm build`). Lo prueba
// apps/docs/src/app/initial-js.spec.ts.
//
// Uso: node apps/docs/scripts/check-initial-js.mjs [carpeta]   (por defecto, dist/docs/browser)
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const WARNING_KB = 325;
const ERROR_KB = 335;

const root = resolve(
  process.argv[2] ??
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'dist', 'docs', 'browser'),
);

const html = readFileSync(join(root, 'index.html'), 'utf8');
const tags = html.match(/<(?:script|link)\b[^>]*>/gi) ?? [];
const attr = (tag, name) => new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1];
const local = (file) => file && !/^[a-z]+:|^\/\//i.test(file);

const js = new Set();
const css = new Set();
for (const tag of tags) {
  if (/^<script/i.test(tag)) {
    const src = attr(tag, 'src');
    if (local(src) && attr(tag, 'type') === 'module') js.add(src);
  } else {
    const rel = attr(tag, 'rel')?.toLowerCase();
    const href = attr(tag, 'href');
    if (!local(href)) continue;
    if (rel === 'modulepreload') js.add(href);
    else if (rel === 'stylesheet') css.add(href);
  }
}

// gzip (zlib por defecto) y brotli. Brotli es lo que el build de Angular muestra como «Estimated
// transfer size» (los archivos de menos de 1 KiB, sin comprimir); se informa para poder comparar.
function measure(files) {
  let raw = 0;
  let gzip = 0;
  let brotli = 0;
  for (const file of files) {
    const content = readFileSync(join(root, file));
    raw += content.length;
    gzip += gzipSync(content).length;
    brotli += content.length < 1024 ? content.length : brotliCompressSync(content).length;
  }
  return { raw, gzip, brotli };
}

const kb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;
const sizes = ({ raw, gzip, brotli }) => `${kb(raw)} crudo, ${kb(gzip)} gzip, ${kb(brotli)} brotli`;
const scripts = measure(js);
const styles = measure(css);

console.log(
  `JS inicial: ${sizes(scripts)} (${js.size} archivos; ` +
    `aviso desde ${WARNING_KB} kB, error desde ${ERROR_KB} kB, sobre el crudo)`,
);
console.log(`CSS global: ${sizes(styles)}`);

if (scripts.raw >= ERROR_KB * 1000) {
  console.error(
    `El JS inicial (${kb(scripts.raw)}) pasa el límite de ${ERROR_KB} kB. Algo se coló al bundle ` +
      'inicial: revisa los imports con `ng build docs --stats-json`. El límite no se sube sin decidirlo (spec 10).',
  );
  process.exit(1);
}
if (scripts.raw >= WARNING_KB * 1000) {
  console.warn(
    `Aviso: el JS inicial (${kb(scripts.raw)}) pasa los ${WARNING_KB} kB. Averigua por qué antes de seguir (spec 10).`,
  );
}
