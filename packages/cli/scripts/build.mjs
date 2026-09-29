// Compila los schematics de @mimi-ng/cli y empaqueta las plantillas de ui-core (tareas 3.1 y 3.2).
// Solo APIs de Node (sin cp ni rm de shell), para que funcione igual en Windows.
import { execFileSync } from 'node:child_process';
import { cp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(cliRoot, '..', '..');
const src = join(cliRoot, 'src');
const dist = join(cliRoot, 'dist');
const uiCoreLib = join(repoRoot, 'packages', 'ui-core', 'src', 'lib');

/** Carpetas de ui-core que se entregan con la CLI. */
const TEMPLATE_DIRS = ['components', 'utils', 'theme'];

/**
 * Archivos que no se entregan, relativos a ui-core/src/lib. `utils/index.ts` es el índice de
 * utils: haría que quien use solo Button arrastre `@angular/forms`.
 */
const EXCLUDED = ['utils/index.ts'];

/** Pruebas y excluidos: nunca van en el paquete. Normaliza "\" para que funcione en Windows. */
const isShipped = (file) => {
  const rel = relative(uiCoreLib, file).split(sep).join('/');
  return !rel.endsWith('.spec.ts') && !EXCLUDED.includes(rel);
};

// 1. Limpia.
await rm(dist, { recursive: true, force: true });

// 2. Compila los schematics a CommonJS (el runtime de schematics los carga con require()).
const require = createRequire(import.meta.url);
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', cliRoot], {
  stdio: 'inherit',
});

// 3. Copia collection.json, registry.json y los schema.json (tsc no copia los que no importa).
await cp(src, dist, {
  recursive: true,
  filter: (file) => {
    const rel = relative(src, file).split(sep).join('/');
    return rel === '' || !rel.includes('.') || rel.endsWith('.json');
  },
});

// 4. Plantillas: los archivos de ui-core que copia la CLI, sin pruebas ni excluidos.
for (const dir of TEMPLATE_DIRS) {
  await cp(join(uiCoreLib, dir), join(dist, 'templates', dir), {
    recursive: true,
    filter: isShipped,
  });
}

// 5. Licencia y avisos de terceros: npm solo publica lo que está dentro del paquete.
for (const file of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  await cp(join(repoRoot, file), join(cliRoot, file));
}

console.log(`@mimi-ng/cli compilado en ${relative(repoRoot, dist)}`);
