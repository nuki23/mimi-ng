import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import registryJson from './registry.json';
import { type Registry, resolveItems } from './registry';

/**
 * Prueba de consistencia: el registro no puede quedar desactualizado cuando cambia un
 * componente de ui-core. Lee el código real y compara.
 */

const registry = registryJson as Registry;
const here = dirname(fileURLToPath(import.meta.url));
const uiCoreRoot = join(here, '..', '..', 'ui-core');
const lib = join(uiCoreRoot, 'src', 'lib');
const uiCorePackage = JSON.parse(readFileSync(join(uiCoreRoot, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

/**
 * Paquetes que no se declaran: toda app Angular ya los trae. Cualquier otro (por ejemplo
 * `@angular/forms` o `@angular/cdk`) debe ir en `dependencies` o `peerDependencies`.
 */
const IMPLICIT = ['@angular/core', '@angular/common', 'rxjs'];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * Archivos que de verdad se entregan: lo que scripts/build.mjs dejó en dist/templates
 * (`pnpm test:cli` compila antes). Así la prueba y el build no pueden divergir.
 */
const templates = join(here, '..', 'dist', 'templates');
const shipped = walk(templates).map((f) => relative(templates, f).split(sep).join('/'));

/** Especificadores importados por un archivo (también `import type` y `export … from`). */
function importsOf(file: string): string[] {
  const source = readFileSync(join(lib, file), 'utf8');
  return [...source.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]/g)].map(
    (m) => m[1],
  );
}

/** `@angular/forms/signals` → `@angular/forms`; `clsx` → `clsx`. */
const packageName = (spec: string) =>
  spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];

/** `@/components/ui/utils/cn` → `utils/cn`; `@/components/ui/card` → `card`. */
const registryName = (spec: string) => spec.replace('@/components/ui/', '');

describe('registry.json', () => {
  const entries = Object.entries(registry.items);

  it('una sola fuente de versión: el package.json de la CLI (tarea 3.8)', () => {
    const cliVersion = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version;
    expect(cliVersion).toMatch(/^\d+\.\d+\.\d+/);
    // El registry.json fuente no la repite; el build la escribe en dist/registry.json.
    expect((registryJson as { version?: string }).version).toBeUndefined();
    const built = JSON.parse(readFileSync(join(here, '..', 'dist', 'registry.json'), 'utf8'));
    expect(built.version).toBe(cliVersion);
    // ui-core no tiene versión propia: se entrega dentro de la CLI.
    expect(
      JSON.parse(readFileSync(join(uiCoreRoot, 'package.json'), 'utf8')).version,
    ).toBeUndefined();
  });

  it('cada archivo listado existe en ui-core', () => {
    for (const [name, item] of entries) {
      for (const file of item.files) {
        expect(existsSync(join(lib, file)), `${name}: ${file}`).toBe(true);
      }
    }
  });

  it('cada archivo entregado pertenece a un solo ítem, y cada archivo listado se entrega', () => {
    const owners = new Map<string, string[]>();
    for (const [name, item] of entries) {
      for (const file of item.files) owners.set(file, [...(owners.get(file) ?? []), name]);
    }
    for (const file of shipped) {
      expect(owners.get(file) ?? [], file).toHaveLength(1);
    }
    expect([...owners.keys()].sort()).toEqual([...shipped].sort());
  });

  it('el paquete no trae pruebas ni el índice de utils (arrastraría @angular/forms)', () => {
    expect(shipped.filter((f) => f.endsWith('.spec.ts'))).toEqual([]);
    expect(shipped).not.toContain('utils/index.ts');
    expect(shipped).toContain('theme/theme-base.css');
  });

  it('suggestedDependencies usan la versión del showcase (package.json de la raíz)', () => {
    const rootPackage = JSON.parse(
      readFileSync(join(uiCoreRoot, '..', '..', 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> };
    for (const [pkg, range] of Object.entries(registry.suggestedDependencies ?? {})) {
      expect(range, pkg).toBe(rootPackage.dependencies[pkg]);
    }
    expect(registry.suggestedDependencies).toHaveProperty('@lucide/angular');
  });

  it('las importaciones de un ítem están declaradas; nada sobra', () => {
    for (const [name, item] of entries) {
      const own = new Set(item.files);
      const usedItems = new Set<string>();
      const usedPackages = new Set<string>();

      for (const file of item.files.filter((f) => f.endsWith('.ts'))) {
        for (const spec of importsOf(file)) {
          if (spec.startsWith('.')) {
            // Relativa: debe quedarse dentro de los archivos del propio ítem.
            const target = posix.normalize(posix.join(posix.dirname(file), spec)) + '.ts';
            expect(own.has(target), `${name}: ${file} importa ${spec} (fuera del ítem)`).toBe(true);
          } else if (spec.startsWith('@/components/ui/')) {
            usedItems.add(registryName(spec));
          } else if (!IMPLICIT.includes(packageName(spec))) {
            usedPackages.add(packageName(spec));
          }
        }
      }

      const declaredItems = new Set(item.registryDependencies ?? []);
      const declaredPackages = new Set([
        ...Object.keys(item.dependencies ?? {}),
        ...Object.keys(item.peerDependencies ?? {}),
      ]);
      expect([...usedItems].sort(), `${name}: registryDependencies`).toEqual(
        [...declaredItems].sort(),
      );
      expect([...usedPackages].sort(), `${name}: dependencies + peerDependencies`).toEqual(
        [...declaredPackages].sort(),
      );
    }
  });

  it('las versiones son las del package.json de ui-core', () => {
    for (const [name, item] of entries) {
      for (const [pkg, range] of Object.entries(item.dependencies ?? {})) {
        expect(range, `${name}: ${pkg}`).toBe(uiCorePackage.dependencies[pkg]);
      }
      for (const [pkg, range] of Object.entries(item.peerDependencies ?? {})) {
        expect(range, `${name}: ${pkg}`).toBe(uiCorePackage.peerDependencies[pkg]);
      }
    }
  });

  it('cada registryDependency existe y no hay ciclos', () => {
    for (const [name] of entries) {
      expect(() => resolveItems(name, registry), name).not.toThrow();
    }
  });

  it('resolveItems pone las dependencias primero y sin repetir', () => {
    expect(resolveItems('input', registry)).toEqual([
      'utils/cn',
      'utils/control-styles',
      'utils/field-state',
      'input',
    ]);
    expect(() => resolveItems('nope', registry)).toThrow('"nope" no existe');
  });

  it('el README del paquete lista todos los componentes del registro, con su ng g mimi', () => {
    const readme = readFileSync(join(here, '..', 'README.md'), 'utf8');
    const components = entries
      .filter(([, item]) => item.type === 'component')
      .map(([name]) => name);
    const missing = components.filter((name) => !readme.includes(`\`ng g mimi ${name}\``));
    expect(missing).toEqual([]);
    // Y ninguno de más.
    const listed = [...readme.matchAll(/`ng g mimi ([a-z-]+)`/g)].map((m) => m[1]);
    expect(listed.filter((name) => !components.includes(name))).toEqual([]);
  });

  it('la lista del x-prompt de ui es la de los componentes del registro', () => {
    const schema = JSON.parse(readFileSync(join(here, 'ui', 'schema.json'), 'utf8'));
    const items = schema.properties.components['x-prompt'].items as { value: string }[];
    const components = entries
      .filter(([, item]) => item.type === 'component')
      .map(([name]) => name)
      .sort();
    expect(items.map((i) => i.value)).toEqual(components);
    // Sin enum: un nombre desconocido llega al schematic, que sugiere el parecido.
    expect(schema.properties.components.items.enum).toBeUndefined();
  });
});
