import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/** Metadatos de publicación de @mimi-ng/cli (tarea L.2). */

const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8'));
const angularCore = JSON.parse(
  readFileSync(
    join(here, '..', '..', '..', 'node_modules', '@angular', 'core', 'package.json'),
    'utf8',
  ),
);

describe('package.json de @mimi-ng/cli', () => {
  it('tiene lo que npm muestra y usa para buscar', () => {
    expect(pkg.description).toMatch(/Angular/);
    expect(pkg.keywords).toEqual(expect.arrayContaining(['angular', 'tailwindcss', 'schematics']));
    expect(pkg.homepage).toBe('https://ng.mimiworks.dev');
    expect(pkg.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/nuki23/mimi-ng.git',
      directory: 'packages/cli',
    });
    expect(pkg.bugs.url).toBe('https://github.com/nuki23/mimi-ng/issues');
    expect(pkg.license).toBe('MIT');
  });

  it('author sin correo', () => {
    expect(pkg.author).toBe('Ariel O (https://github.com/nuki23)');
    expect(JSON.stringify(pkg)).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
  });

  it('se publica como paquete público (los paquetes con alcance son privados por defecto)', () => {
    expect(pkg.publishConfig).toEqual({ access: 'public' });
  });

  it('se puede publicar (sin private) y compila justo antes (prepublishOnly)', () => {
    expect(pkg.private).toBeUndefined();
    // dist/ está en .gitignore: sin esto, se publicaría el dist que hubiera en disco.
    expect(pkg.scripts.prepublishOnly).toBe('node scripts/build.mjs');
  });

  it('engines.node es el mismo que exige @angular/core (spec, sección 12)', () => {
    expect(pkg.engines.node).toBe(angularCore.engines.node);
  });

  it('sigue siendo CommonJS y con ng-add', () => {
    expect(pkg.type).toBe('commonjs');
    expect(pkg.schematics).toBe('./dist/collection.json');
    expect(pkg['ng-add']).toEqual({ save: 'devDependencies' });
  });
});
