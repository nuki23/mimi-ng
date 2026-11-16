import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SortableListPage } from './sortable-list-page';
import { SORTABLE_LIST_PAGE } from './sortable-list.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('SortableListPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(SORTABLE_LIST_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(SortableListPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo, tamaños, deshabilitada, prioridades y el tablero (R.21).
      expect(previews.length).toBe(5);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-sortable-list ul')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/sortable-list';");
        expect(code).toMatch(/export class SortableList\w+Example/);
      }
      // Cada lista tiene nombre y sus asas, el texto en español.
      for (const list of Array.from(el.querySelectorAll('mimi-sortable-list ul'))) {
        expect(
          list.getAttribute('aria-label') || list.getAttribute('aria-labelledby'),
        ).toBeTruthy();
      }
      const [demo, sizes, states, priorities] = previews.map((p) => p.example!);
      expect(demo.querySelector('[data-slot="handle"]')!.getAttribute('aria-label')).toBe(
        'Reordenar Diseñar',
      );
      const sized = Array.from(sizes.querySelectorAll('mimi-sortable-list'));
      expect(sized.map((list) => list.getAttribute('data-size'))).toEqual(['sm', 'md', 'lg']);
      expect(states.querySelector('mimi-sortable-list[data-disabled]')).not.toBeNull();
      expect(states.querySelector<HTMLButtonElement>('[data-slot="handle"]')!.disabled).toBe(true);
      expect(priorities.querySelector('[data-slot="handle"]')!.getAttribute('aria-label')).toBe(
        'Reordenar Revisar contraste AA',
      );
      // El tablero: tres listas en un grupo; la vacía muestra dónde soltar.
      const board = previews[4].example!;
      expect(board.querySelectorAll('mimi-sortable-group mimi-sortable-list').length).toBe(3);
      expect(board.querySelector('[data-slot="empty"]')!.textContent!.trim()).toBe('Suelta aquí');
      expect(el.querySelector('#texts')).not.toBeNull();
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
