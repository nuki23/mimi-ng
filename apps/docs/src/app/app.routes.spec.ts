import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { HighlighterService } from './code/highlighter.service';
import { PAGE_EXAMPLES_TIMEOUT } from './code/code-preview.testing';
import { DOCS_ROUTES } from './pages/docs/docs.routes';

/**
 * Importar todas las páginas crece con cada componente (no es una prueba de un ejemplo): sola
 * tarda unos 5 s; con `pnpm test` completo, más de 20. 60 s da margen sin tapar un cuelgue.
 */
const ALL_PAGES_TIMEOUT = 60_000;

/**
 * Las rutas de /docs están en pages/docs/docs.routes.ts y se cargan con loadChildren (M.13).
 * Estas pruebas usan la tabla real de la app: navegación directa, redirección y título.
 */
describe('Rutas de la app', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        // Sin resaltado real: el código de los ejemplos no hace falta aquí.
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
  });

  it('/docs/... no está en la tabla de main: llega por loadChildren', () => {
    const docs = routes.find((r) => r.path === 'docs');
    expect(docs?.loadComponent).toBeDefined();
    expect(docs?.loadChildren).toBeDefined();
    expect(docs?.children).toBeUndefined();
  });

  it(
    'cada ruta de /docs carga su página y tiene título',
    async () => {
      const pages = DOCS_ROUTES.filter((r) => r.loadComponent);
      expect(pages.length).toBeGreaterThan(30);
      // Importa los ~50 módulos de página, en paralelo: en serie, con `pnpm test` completo y el
      // equipo cargado, pasó de los 20 s al sumar la página de Command (G3.3, 07/11/2026).
      const components = await Promise.all(pages.map((route) => route.loadComponent!()));
      pages.forEach((route, i) => {
        expect(route.title, route.path).toEqual(expect.any(String));
        expect(components[i], route.path).toEqual(expect.any(Function));
      });
    },
    ALL_PAGES_TIMEOUT,
  );

  it(
    'la navegación directa a una página de componente muestra el layout, la página y el título',
    async () => {
      const harness = await RouterTestingHarness.create('/docs/components/button');
      await harness.fixture.whenStable();
      const el = harness.routeNativeElement as HTMLElement;

      expect(TestBed.inject(Router).url).toBe('/docs/components/button');
      expect(TestBed.inject(DOCUMENT).title).toBe('Button · Mimi');
      // El layout de docs (barra lateral) y la página dentro.
      expect(harness.fixture.nativeElement.querySelector('app-docs-sidebar')).not.toBeNull();
      expect(el.querySelector('h1')?.textContent).toContain('Button');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('/docs redirige a la introducción', async () => {
    const harness = await RouterTestingHarness.create('/docs');
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/docs/introduction');
    expect(TestBed.inject(DOCUMENT).title).toBe('Introducción · Mimi');
  });

  it('una ruta de /docs que no existe cae en la página no encontrada', async () => {
    await RouterTestingHarness.create('/docs/components/no-existe');
    expect(TestBed.inject(DOCUMENT).title).toBe('Página no encontrada · Mimi');
  });
});
