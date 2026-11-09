import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../code/highlighter.service';
import { DOCS_NAV } from '../../../layout/docs-nav';
import { BLOCK_PREVIEWS } from '../../../preview/block-previews';
import { DOCS_ROUTES } from '../docs.routes';
import { Login01Page } from './login-01-page';
import { Login02Page } from './login-02-page';
import { Otp01Page } from './otp-01-page';
import { Pricing01Page } from './pricing-01-page';
import { Settings01Page } from './settings-01-page';
import { Table01Page } from './table-01-page';
import { Signup01Page } from './signup-01-page';

interface Case {
  name: string;
  /** Lo que dice el registro de la CLI (B.11-a). */
  kind: 'page' | 'section';
  page: Type<unknown>;
  components: string[];
  states: string[];
}

/** Una fila por Block con página (B.2 en adelante). */
const CASES: Case[] = [
  {
    name: 'login-01',
    kind: 'page',
    page: Login01Page,
    components: ['card', 'input', 'password', 'checkbox', 'button', 'form-field', 'separator'],
    states: ['loading', 'error'],
  },
  {
    name: 'login-02',
    kind: 'page',
    page: Login02Page,
    components: ['input', 'button', 'form-field', 'avatar'],
    states: ['image', 'loading', 'error'],
  },
  {
    name: 'signup-01',
    kind: 'page',
    page: Signup01Page,
    components: ['input', 'password', 'checkbox', 'button', 'form-field'],
    states: ['loading', 'error'],
  },
  {
    name: 'otp-01',
    kind: 'page',
    page: Otp01Page,
    components: ['input-otp', 'button', 'card'],
    states: ['resend'],
  },
  {
    name: 'settings-01',
    kind: 'page',
    page: Settings01Page,
    components: [
      'tabs',
      'input',
      'textarea',
      'switch',
      'avatar',
      'badge',
      'progress',
      'button',
      'card',
      'separator',
      'form-field',
    ],
    states: ['notifications', 'security', 'billing'],
  },
  {
    name: 'table-01',
    kind: 'page',
    page: Table01Page,
    components: ['data-table', 'badge', 'button', 'checkbox', 'input'],
    states: ['selected'],
  },
  {
    name: 'pricing-01',
    kind: 'section',
    page: Pricing01Page,
    components: ['toggle-group', 'badge', 'button'],
    states: ['yearly'],
  },
];

/**
 * Páginas de los Blocks: plantilla BlockDoc, archivos reales y estados de la vista previa.
 * 20 s (M.12): la primera carga la vista previa en frío; en `pnpm test` completo, justo después
 * de `pnpm build`, pasó de los 5 s de Vitest (07/11/2026, B.11). Sola tarda unos 2 s.
 */
describe('Páginas de los Blocks', { timeout: 20_000 }, () => {
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

  for (const { name, kind, page, components, states } of CASES) {
    it(`${name}: vista previa, instalación, componentes, código real y API`, async () => {
      const fixture = TestBed.createComponent(page);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;

      expect(el.querySelector('h1')?.textContent?.trim()).toBe(name);
      expect(el.querySelector('iframe')?.getAttribute('src')).toBe(`/preview/blocks/${name}`);
      expect(el.textContent).toContain(`ng g mimi ${name}`);
      // Ningún Block pone <main>: la página lo dice (con lo del <header>).
      expect(el.querySelector('[data-slot="landmarks"]')?.textContent).toContain('<main>');
      // Un Block es tuyo; la carpeta se puede cambiar; una página: la CLI no toca las rutas
      // (B.11). Una sección: aliases.blocks.
      const notes = el.querySelector('[data-slot="block-notes"]')?.textContent ?? '';
      const install = el.querySelector('[data-slot="block-install"]')?.textContent ?? '';
      expect(notes).toContain('componente Angular tuyo');
      const pageName = name.replace(/-\d+$/, '');
      const pageClass = `${pageName[0].toUpperCase()}${pageName.slice(1)}Page`;
      if (kind === 'page') {
        expect(install).toContain(`src/app/pages/${pageName}/`);
        expect(install).toContain(pageClass);
        expect(el.textContent).toContain(
          `{ path: '${pageName}', loadChildren: () => import('./pages/${pageName}/${pageName}.routes')`,
        );
        expect(notes).toContain('aliases.pages');
        expect(notes).toContain(`--name admin-${pageName}`);
        expect(notes).toContain('app.routes.ts');
        expect(notes).toContain('0.4.0');
      } else {
        expect(install).toContain('sección');
        expect(notes).toContain('aliases.blocks');
      }
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'preview',
        'installation',
        'usage',
        'code',
        'api',
      ]);
      const links = Array.from(el.querySelectorAll('#components + ul a'));
      expect(links.map((a) => a.textContent)).toEqual(components);
      // Los archivos como los deja la CLI: una página, convertida (B.11); una sección, tal cual.
      const files = Array.from(el.querySelectorAll('#code ~ h3')).map((h) => h.textContent);
      expect(files).toEqual(
        kind === 'page'
          ? [
              `${pageName}/${pageName}.ts`,
              `${pageName}/${pageName}.html`,
              `${pageName}/${pageName}.routes.ts`,
            ]
          : [`${name}/${name}.ts`, `${name}/${name}.html`, `${name}/index.ts`],
      );
      const fileInputs = fixture.debugElement
        .queryAll((de) => de.name === 'app-code-block')
        .map((de) => de.componentInstance.code() as string);
      if (kind === 'page') {
        expect(fileInputs.some((code) => code.includes(`export class ${pageClass} {`))).toBe(true);
        expect(fileInputs.some((code) => code.includes(`mimi-${name}`))).toBe(false);
      }
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
