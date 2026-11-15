// Genera apps/docs/src/app/doc-page/install-map.json: el mapa reducido del registro de la CLI que
// usa «Qué instala» en las páginas de componentes (decidido por el usuario el 14/11/2026). Antes la
// página importaba registry.json entero (20 kB crudos en el chunk de la plantilla); ahora solo
// viaja, por componente, lo que se muestra: otros ítems que copia, paquetes de npm y CSS.
//
// Corre dentro de `pnpm build:docs`, antes de `ng build`. El archivo va en el repo (lo usan
// `ng serve` y `ng test`); doc-page/doc-page.spec.ts falla si no coincide con registry.json.
//
// Uso: node apps/docs/scripts/install-map.mjs [--check]   (--check: no escribe, falla si cambia)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const REGISTRY = join(ROOT, 'packages', 'cli', 'src', 'registry.json');
const OUT = join(ROOT, 'apps', 'docs', 'src', 'app', 'doc-page', 'install-map.json');

/** Lo que ya trae `ng add @mimi-ng/cli` (spec 5, «Qué hace init»): no se repite en la página. */
const FROM_INIT_ITEMS = new Set(['theme', 'utils/cn', 'utils/control-styles']);
const FROM_INIT_PACKAGES = new Set(['clsx', 'tailwind-merge', 'class-variance-authority']);

const { items } = JSON.parse(readFileSync(REGISTRY, 'utf8'));

function extras(name) {
  const seen = new Set();
  const visit = (item) => {
    if (seen.has(item)) return;
    seen.add(item);
    for (const dep of items[item]?.registryDependencies ?? []) visit(dep);
  };
  visit(name);
  const closure = [...seen].map((item) => items[item]).filter(Boolean);
  const packages = new Set(
    closure.flatMap((item) => [
      ...Object.keys(item.dependencies ?? {}),
      ...Object.keys(item.peerDependencies ?? {}),
    ]),
  );
  return {
    items: [...seen].filter((item) => item !== name && !FROM_INIT_ITEMS.has(item)).sort(),
    packages: [...packages].filter((p) => !FROM_INIT_PACKAGES.has(p)).sort(),
    css: [...new Set(closure.flatMap((item) => item.cssImports ?? []))].sort(),
  };
}

// Solo los componentes: son los que tienen página en /docs/components/.
const map = Object.fromEntries(
  Object.keys(items)
    .filter((name) => items[name].type === 'component')
    .sort()
    .map((name) => [name, extras(name)]),
);

const options = (await prettier.resolveConfig(OUT)) ?? {};
const text = await prettier.format(JSON.stringify(map), { ...options, filepath: OUT });

if (process.argv.includes('--check')) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {}
  if (current !== text) {
    console.error('install-map.json no coincide con registry.json: corre el script sin --check.');
    process.exit(1);
  }
  console.log('install-map.json al día.');
} else {
  writeFileSync(OUT, text);
  console.log(`install-map.json: ${Object.keys(map).length} componentes.`);
}
