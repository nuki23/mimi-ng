import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../code/highlighter.service';
import { DOCS_NAV } from '../../../layout/docs-nav';
import { BLOCK_PREVIEWS } from '../../../preview/block-previews';
import { DOCS_ROUTES } from '../docs.routes';
import { Login01Page } from './login-01-page';
import { Login02Page } from './login-02-page';

interface Case {
  name: string;
  page: Type<unknown>;
  components: string[];
  states: string[];
}

/** Una fila por Block con página (B.2 en adelante). */
const CASES: Case[] = [
  {
    name: 'login-01',
    page: Login01Page,
    components: ['card', 'input', 'password', 'checkbox', 'button', 'form-field', 'separator'],
    states: ['loading', 'error'],
  },
  {
    name: 'login-02',
    page: Login02Page,
    components: ['input', 'button', 'form-field', 'avatar'],
    states: ['image', 'loading', 'error'],
  },
];

/** Páginas de los Blocks: plantilla BlockDoc, archivos reales y estados de la vista previa. */
describe('Páginas de los Blocks', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
  });

  for (const { name, page, components, states } of CASES) {
    it(`${name}: vista previa, instalación, componentes, código real y API`, async () => {
      const fixture = TestBed.createComponent(page);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('h1')?.textContent?.trim()).toBe(name);
      expect(el.querySelector('iframe')?.getAttribute('src')).toBe(`/preview/blocks/${name}`);
      expect(el.textContent).toContain(`ng g mimi ${name}`);
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'preview',
        'installation',
        'usage',
        'code',
        'api',
      ]);
      const links = Array.from(el.querySelectorAll('#components + ul a'));
      expect(links.map((a) => a.textContent)).toEqual(components);
      // Los archivos reales del Block (el .ts declara su selector).
      const files = Array.from(el.querySelectorAll('#code ~ h3')).map((h) => h.textContent);
      expect(files).toEqual([`${name}/${name}.ts`, `${name}/${name}.html`, `${name}/index.ts`]);
      // Los estados del selector existen en la vista previa, y el Block carga.
      const preview = BLOCK_PREVIEWS[name];
      expect(Object.keys(preview.states ?? {}).sort()).toEqual([...states].sort());
      expect(await preview.load()).toEqual(expect.any(Function));
      // Ruta y menú.
      expect(DOCS_ROUTES.some((r) => r.path === `blocks/${name}`)).toBe(true);
      const nav = DOCS_NAV.find((s) => s.title === 'Blocks')!.items;
      expect(nav.find((i) => i.path === `/docs/blocks/${name}`)?.status).toBe('ready');
    });
  }

  it('cada Block de la vista previa tiene su página', () => {
    expect(Object.keys(BLOCK_PREVIEWS).sort()).toEqual(CASES.map((c) => c.name).sort());
  });
});
