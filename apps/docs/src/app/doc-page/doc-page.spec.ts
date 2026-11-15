import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { settle } from '../code/code-preview.testing';
import { HighlighterService } from '../code/highlighter.service';
import { DocPageView } from './doc-page';
import { countSentences, countWords, usageTemplateLines, validateDocPage } from './doc-page.rules';
import type { DocExample, DocPage } from './doc-page.types';
import { textParts } from './doc-text';
import registry from '@mimi-ng/cli/registry.json';
import { INSTALL_MAP, installExtras } from './install-extras';

@Component({
  selector: 'app-fake-example',
  template: '<button type="button">Ejemplo</button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FakeExample {}

const example = (id: string, extra: Partial<DocExample> = {}): DocExample => ({
  id,
  title: `Título ${id}`,
  sentence: `Muestra el caso ${id} con una frase corta.`,
  component: FakeExample,
  source: 'export class FakeExample {}\n',
  ...extra,
});

/** Una página que cumple la plantilla. */
const PAGE: DocPage = {
  name: 'Fake',
  lead: 'Componente de prueba para comprobar que la plantilla pinta cada sección en su orden fijo.',
  demo: example('demo', { title: '' }),
  install: 'button',
  usage: {
    code: '@Component({\n  template: `<button mimiBtn>Guardar</button>`,\n})',
    note: 'Una nota corta con `código`.',
  },
  examples: {
    custom: [example('custom-class')],
    sizes: [example('sizes', { more: example('matrix', { title: 'Ver la matriz' }) })],
  },
  forms: undefined,
  accessibility: { points: ['Enter activa.'], more: ['Un detalle más.'] },
  api: {
    inputs: [{ name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Tamaño.' }],
    outputs: [{ name: 'changed', type: 'void', description: 'Cambió.' }],
    service: [{ name: 'FakeService.open()', type: 'FakeRef', description: 'Abre algo.' }],
    dataAttributes: ['data-size'],
  },
  tokens: 'button',
};

describe('validateDocPage (variante A)', () => {
  it('una página que cumple no tiene errores', () => {
    expect(validateDocPage(PAGE)).toEqual([]);
  });

  it('cuenta palabras, frases y líneas de la plantilla de «Uso»', () => {
    expect(countWords('Usa `tone` para  el color.')).toBe(5);
    expect(countSentences('Una. Dos con `a.b`. Tres')).toBe(3);
    expect(usageTemplateLines('template: `<b>x</b>`,')).toBe(1);
    expect(usageTemplateLines('a\n  template: `\n    <b>\n    <i>\n  `,\n})')).toBe(2);
    expect(usageTemplateLines('inject(Toast).show();')).toBe(1);
  });

  it('falla con cada límite y cada sección que falta', () => {
    const long = Array.from({ length: 30 }, () => 'palabra').join(' ');
    const bad: DocPage = {
      ...PAGE,
      lead: 'Corta.',
      demo: example('demo', { source: 'x\n'.repeat(61) }),
      usage: { code: 'template: `\n' + 'x\n'.repeat(13) + '`,', note: 'Una. Dos. Tres.' },
      examples: {
        sizes: Array.from({ length: 9 }, (_, i) => example(`e${i}`)),
        states: [
          example('sin-frase', { sentence: 'Título sin-frase' }),
          example('larga', { sentence: long, source: 'x\n'.repeat(81) }),
        ],
      },
      accessibility: { points: [] },
      api: { inputs: [{ name: 'x', type: 'y', default: 'z', description: long }] },
      tokens: undefined,
    };
    const errors = validateDocPage(bad).join('\n');
    for (const expected of [
      'frase de cabecera',
      'la demo tiene 61 líneas',
      'plantilla de «Uso» tiene 13',
      'la nota de «Uso» tiene 3 frases',
      'ejemplos vivos',
      'ejemplo «sin-frase»: sin su frase',
      'ejemplo «larga»: la frase tiene 30 palabras',
      'tiene 81 líneas',
      'no tiene ninguna viñeta',
      'API «x»',
      "falta «tokens: 'button'»",
    ]) {
      expect(errors).toContain(expected);
    }
  });

  it('«Variables CSS» admite varias tablas: la primera, la del componente (PD-9)', () => {
    expect(validateDocPage({ ...PAGE, tokens: ['button', 'chip'] })).toEqual([]);
    expect(validateDocPage({ ...PAGE, tokens: ['chip', 'button'] }).join()).toContain(
      "falta «tokens: 'button'» (la primera)",
    );
    expect(validateDocPage({ ...PAGE, tokens: ['button', 'button'] }).join()).toContain(
      'repite una tabla',
    );
  });

  it('pide «Variables CSS» también cuando la tabla tiene otro nombre (date, menu, sortable)', () => {
    const errors = validateDocPage({ ...PAGE, install: 'dropdown-menu', tokens: undefined });
    expect(errors.join()).toContain("falta «tokens: 'menu'»");
  });

  it('pide las pestañas de formularios si el componente está en FORMS_SPECS', () => {
    expect(validateDocPage({ ...PAGE, install: 'select', tokens: 'select' }).join()).toContain(
      "falta «forms: 'select'»",
    );
  });

  it('no deja nombres internos en el texto visible', () => {
    const errors = validateDocPage({
      ...PAGE,
      accessibility: { points: ['Usa el CDK por dentro.'] },
    });
    expect(errors.join()).toContain('nombre interno');
  });
});

describe('textParts', () => {
  it('separa el código marcado con comillas invertidas', () => {
    expect(textParts('Usa `tone` aquí')).toEqual([
      { code: false, text: 'Usa ' },
      { code: true, text: 'tone' },
      { code: false, text: ' aquí' },
    ]);
  });

  it('separa los enlaces internos; las palabras cuentan solo su texto', () => {
    expect(textParts('Usa [Textarea](/docs/components/textarea), no `x`.')).toEqual([
      { code: false, text: 'Usa ' },
      { code: false, text: 'Textarea', href: '/docs/components/textarea' },
      { code: false, text: ', no ' },
      { code: true, text: 'x' },
      { code: false, text: '.' },
    ]);
    // Solo rutas internas: un enlace externo queda como texto.
    expect(textParts('[web](https://example.com)')).toEqual([
      { code: false, text: '[web](https://example.com)' },
    ]);
    expect(countWords('Usa [Textarea](/docs/components/textarea).')).toBe(2);
  });
});

describe('installExtras (desde el registro de la CLI)', () => {
  it('Select: option-list, aria, cdk y el CSS del overlay; sin lo que ya trae ng add', () => {
    const x = installExtras('select');
    expect(x.items).toContain('option-list');
    expect(x.items).not.toContain('utils/cn');
    expect(x.packages).toEqual(expect.arrayContaining(['@angular/aria', '@angular/cdk']));
    expect(x.packages).not.toContain('class-variance-authority');
    expect(x.css).toEqual(['@angular/cdk/overlay-prebuilt.css']);
  });

  it('falla con un nombre que no está en el registro', () => {
    expect(() => installExtras('no-existe')).toThrow(/registro/);
  });

  // El mapa lo genera apps/docs/scripts/install-map.mjs; aquí se recalcula desde el registro con
  // otra implementación. Si falla: `node apps/docs/scripts/install-map.mjs` (o `pnpm build:docs`).
  it('el mapa reducido (install-map.json) coincide con registry.json', () => {
    type Item = {
      type: string;
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      registryDependencies?: string[];
      cssImports?: string[];
    };
    const items = (registry as unknown as { items: Record<string, Item> }).items;
    const fromInit = ['theme', 'utils/cn', 'utils/control-styles'];
    const initPackages = ['clsx', 'tailwind-merge', 'class-variance-authority'];
    const closure = (name: string, acc = new Set<string>()): Set<string> => {
      if (acc.has(name)) return acc;
      acc.add(name);
      for (const dep of items[name].registryDependencies ?? []) closure(dep, acc);
      return acc;
    };
    const expected = Object.fromEntries(
      Object.entries(items)
        .filter(([, item]) => item.type === 'component')
        .map(([name]) => {
          const all = [...closure(name)];
          const deps = all.map((n) => items[n]);
          const pkgs = deps.flatMap((d) => [
            ...Object.keys(d.dependencies ?? {}),
            ...Object.keys(d.peerDependencies ?? {}),
          ]);
          return [
            name,
            {
              items: all.filter((n) => n !== name && !fromInit.includes(n)).sort(),
              packages: [...new Set(pkgs)].filter((p) => !initPackages.includes(p)).sort(),
              css: [...new Set(deps.flatMap((d) => d.cssImports ?? []))].sort(),
            },
          ];
        }),
    );
    expect(INSTALL_MAP).toEqual(expected);
  });
});

@Component({
  imports: [DocPageView],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FakePage {
  protected readonly page = PAGE;
}

describe('DocPageView', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(FakePage);
    await settle(fixture);
    return fixture.nativeElement as HTMLElement;
  }

  it('pinta las secciones con sus nombres e id fijos, en orden', async () => {
    const el = await render();
    expect(Array.from(el.querySelectorAll('h2')).map((h) => [h.id, h.textContent?.trim()])).toEqual(
      [
        ['installation', 'Instalación'],
        ['usage', 'Uso'],
        ['examples', 'Ejemplos'],
        ['accessibility', 'Accesibilidad y teclado'],
        ['api', 'API'],
      ],
    );
    // Los ejemplos van en el orden de las categorías (sizes antes que custom), no en el del objeto.
    expect(Array.from(el.querySelectorAll('h3[id]')).map((h) => h.id)).toEqual([
      'sizes',
      'custom-class',
      'inputs',
      'outputs',
      'service',
      'tokens',
    ]);
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Fake');
  });

  it('cada ejemplo lleva su frase delante y corre en la vista previa', async () => {
    const el = await render();
    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(4); // demo, sizes, su matriz y custom
    for (const preview of previews) {
      expect(preview.previousElementSibling?.getAttribute('data-slot')).toBe('example-sentence');
      expect(preview.querySelector('app-fake-example button')).not.toBeNull();
    }
  });

  it('los desplegables están cerrados y el código en línea se pinta como <code>', async () => {
    const el = await render();
    const details = Array.from(el.querySelectorAll('details'));
    expect(details.map((d) => d.querySelector('summary')?.textContent?.trim())).toEqual([
      'Qué instala',
      'Ver la matriz',
      'Más detalles de teclado y accesibilidad',
    ]);
    expect(details.every((d) => !d.open)).toBe(true);
    expect(el.querySelector('[data-slot="usage-note"] code')?.textContent).toBe('código');
    // Sin espacios de la plantilla entre el código y la puntuación.
    expect(el.querySelector('[data-slot="usage-note"]')?.textContent?.trim()).toBe(
      'Una nota corta con código.',
    );
    expect(el.querySelector('[data-slot="data-attributes"]')?.textContent).toContain('data-size');
    expect(el.querySelector('table[data-kind="outputs"] th')?.textContent?.trim()).toBe('Salida');
    expect(el.querySelector('table[data-kind="service"] th')?.textContent?.trim()).toBe('Miembro');
  });
});
