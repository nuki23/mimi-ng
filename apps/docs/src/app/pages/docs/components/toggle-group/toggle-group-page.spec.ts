import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ToggleGroupPage } from './toggle-group-page';

describe('ToggleGroupPage', () => {
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
      const fixture = TestBed.createComponent(ToggleGroupPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(8);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-toggle-group [mimiToggleGroupItem]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/toggle-group';");
        expect(code).toMatch(/export class ToggleGroup\w+Example/);
      }
      // Todos los grupos tienen nombre.
      for (const group of Array.from(el.querySelectorAll('mimi-toggle-group'))) {
        expect(group.getAttribute('aria-label'), group.outerHTML).toBeTruthy();
      }
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'api',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
