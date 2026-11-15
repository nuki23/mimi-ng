import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { PaginationPage } from './pagination-page';
import { PAGINATION_PAGE } from './pagination.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('PaginationPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(PAGINATION_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          {
            provide: HighlighterService,
            useValue: { highlight: () => new Promise(() => undefined) },
          },
        ],
      });
      const fixture = TestBed.createComponent(PaginationPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y cinco ejemplos.
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-pagination[role="navigation"] input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/pagination';");
        expect(code).toMatch(/export class Pagination\w+Example/);
      }
      // Los textos en español de la página.
      expect(el.querySelector('mimi-pagination')!.getAttribute('aria-label')).toBe('Paginación');
      // Tamaños y la flotante.
      const sizes = Array.from(previews[1].example!.querySelectorAll('mimi-pagination'));
      expect(sizes.map((p) => p.getAttribute('data-size'))).toEqual(['sm', 'md', 'lg']);
      expect(
        previews[2].example!.querySelector('mimi-pagination[data-variant="floating"]'),
      ).not.toBeNull();
      expect(el.querySelector('#texts')).not.toBeNull();
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
