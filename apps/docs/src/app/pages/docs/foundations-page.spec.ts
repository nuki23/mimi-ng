import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../code/highlighter.service';
import {
  FOUNDATION_PACKAGES,
  FOUNDATION_TEXTS,
  type FoundationPackage,
  FoundationsPage,
} from './foundations-page';

/*
 * La página tiene que decir la verdad: la tabla de paquetes se compara con el registro de la CLI
 * (los paquetes de cada componente, contando los que trae) y los textos con los archivos de
 * ui-core. Se leen con fs, como en component-tokens.spec.ts.
 */
const foundationsNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const foundationsFs = foundationsNode.getBuiltinModule('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
const ROOT = foundationsNode.cwd();

interface RegistryItem {
  type: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  registryDependencies?: string[];
}
const registry = JSON.parse(
  foundationsFs.readFileSync(`${ROOT}/packages/cli/src/registry.json`, 'utf8'),
) as { items: Record<string, RegistryItem> };

/** Los paquetes de Angular que llegan con un ítem, siguiendo sus registryDependencies. */
function packagesOf(name: string, seen = new Set<string>()): Set<FoundationPackage> {
  const found = new Set<FoundationPackage>();
  if (seen.has(name)) return found;
  seen.add(name);
  const item = registry.items[name];
  for (const dep of Object.keys({ ...item.dependencies, ...item.peerDependencies })) {
    if (dep === '@angular/forms') found.add('forms');
    if (dep === '@angular/cdk') found.add('cdk');
    // La CLI agrega @angular/cdk junto con @angular/aria (aria lo necesita).
    if (dep === '@angular/aria') found.add('aria').add('cdk');
  }
  for (const dep of item.registryDependencies ?? []) {
    for (const p of packagesOf(dep, seen)) found.add(p);
  }
  return found;
}

describe('FoundationsPage', () => {
  it('las secciones en orden, con su h2 para la TOC', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(FoundationsPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Fundamentos');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'what-gets-copied',
      'imports',
      'class',
      'variant-and-tone',
      'customize',
      'texts',
      'forms',
      'accessibility',
      'technical-base',
      'bundle-size',
      'compatibility',
    ]);
    // Lo verificado, tal cual (decisión de la G1.12).
    expect(el.textContent).toContain('el teclado en Chrome real y NVDA en el Select');
  });

  it('la tabla de paquetes cubre todos los componentes del registro, con sus paquetes reales', () => {
    const components = Object.entries(registry.items)
      .filter(([, item]) => item.type === 'component')
      .map(([name]) => name)
      .sort();
    expect(Object.keys(FOUNDATION_PACKAGES).sort()).toEqual(components);
    for (const name of components) {
      expect([...packagesOf(name)].sort(), name).toEqual([...FOUNDATION_PACKAGES[name]].sort());
    }
  });

  it('cada función de textos y su versión en español existen en ui-core', () => {
    for (const text of FOUNDATION_TEXTS) {
      const code = foundationsFs.readFileSync(
        `${ROOT}/packages/ui-core/src/lib/components/${text.file}.ts`,
        'utf8',
      );
      expect(code, text.provider).toContain(`export function ${text.provider}(`);
      expect(code, text.spanish).toContain(`export const ${text.spanish}`);
    }
  });
});
