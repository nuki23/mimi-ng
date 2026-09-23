import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type Route, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { DOCS_NAV, type DocsNavSection, findDocsNavEntry } from './docs-nav';
import { DocsSidebar } from './docs-sidebar';

@Component({ template: '' })
class StubPage {}

const nav: DocsNavSection[] = [
  {
    title: 'Primeros pasos',
    items: [
      { title: 'Introducción', path: '/docs/introduction', status: 'ready' },
      { title: 'Instalación', path: '/docs/installation', status: 'ready' },
      { title: 'Temas', path: '/docs/themes', status: 'pending' },
    ],
  },
  {
    title: 'Componentes',
    items: [{ title: 'Select', path: '/docs/components/select', status: 'soon' }],
  },
];

describe('DocsSidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'docs/introduction', component: StubPage },
          { path: 'docs/installation', component: StubPage },
        ]),
      ],
    });
  });

  it('renderiza las secciones y sus ítems desde la configuración', async () => {
    const fixture = TestBed.createComponent(DocsSidebar);
    fixture.componentRef.setInput('sections', nav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const titles = Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.trim());
    expect(titles).toEqual(['Primeros pasos', 'Componentes']);
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Documentación');
    expect(el.querySelectorAll('li').length).toBe(4);
  });

  it('solo los ítems ready son enlaces; pending y soon quedan deshabilitados', async () => {
    const fixture = TestBed.createComponent(DocsSidebar);
    fixture.componentRef.setInput('sections', nav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const links = Array.from(el.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/docs/introduction', '/docs/installation']);

    const disabled = Array.from(el.querySelectorAll('[aria-disabled="true"]'));
    expect(disabled.map((d) => d.tagName)).toEqual(['SPAN', 'SPAN']);
    expect(disabled[0].textContent).toContain('Temas');
    expect(disabled[0].textContent).not.toContain('Próximamente');
    expect(disabled[1].textContent).toContain('Select');
    expect(disabled[1].textContent).toContain('Próximamente');
  });

  it('marca el enlace activo con aria-current="page"', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/docs/installation');

    const fixture = TestBed.createComponent(DocsSidebar);
    fixture.componentRef.setInput('sections', nav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const current = el.querySelectorAll('[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent?.trim()).toBe('Instalación');
  });
});

describe('DOCS_NAV', () => {
  /** Rutas completas de la app, a partir de app.routes.ts. */
  const collectPaths = (list: Route[], prefix = ''): string[] =>
    list.flatMap((route) => {
      const path = route.path ? `${prefix}/${route.path}` : prefix;
      return [path, ...collectPaths(route.children ?? [], path)];
    });

  it('cada ítem ready tiene su ruta en app.routes.ts', () => {
    const paths = new Set(collectPaths(routes));
    const ready = DOCS_NAV.flatMap((s) => s.items).filter((i) => i.status === 'ready');
    expect(ready.length).toBeGreaterThan(0);
    for (const item of ready) {
      expect(paths.has(item.path), `falta la ruta ${item.path}`).toBe(true);
    }
  });

  it('findDocsNavEntry da la sección y la página, sin fragmento ni query', () => {
    const entry = findDocsNavEntry('/docs/installation?x=1#step-2');
    expect(entry?.section.title).toBe('Primeros pasos');
    expect(entry?.item.title).toBe('Instalación');
    expect(findDocsNavEntry('/dev/tokens')).toBeNull();
  });
});
