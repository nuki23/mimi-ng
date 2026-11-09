import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SortableListPage } from './sortable-list-page';

describe('SortableListPage', () => {
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
      expect(previews.length).toBe(2);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-sortable-list ul li')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/sortable-list';");
        expect(code).toMatch(/export class SortableList\w+Example/);
      }
      // Cada lista tiene nombre y sus asas, el texto en español.
      for (const list of Array.from(el.querySelectorAll('mimi-sortable-list ul'))) {
        expect(
          list.getAttribute('aria-label') || list.getAttribute('aria-labelledby'),
        ).toBeTruthy();
      }
      expect(el.querySelector('[data-slot="handle"]')!.getAttribute('aria-label')).toBe(
        'Reordenar Revisar contraste AA',
      );
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
