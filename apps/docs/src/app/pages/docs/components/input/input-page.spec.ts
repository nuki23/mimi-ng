import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { InputPage } from './input-page';

describe('InputPage', () => {
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
      const fixture = TestBed.createComponent(InputPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // 9: los de Textarea se fueron a su página (13/11/2026); «En fila» se queda.
      expect(previews.length).toBe(9);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiInput]')).not.toBeNull();
        // Las importaciones son las del proyecto del usuario, no las del monorepo.
        expect(code).toContain("from '@/components/ui/input';");
        expect(code).not.toContain('@mimi-ng/ui-core');
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Input');
      expect(el.querySelector('a[href="/docs/components/textarea"]')).not.toBeNull();
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'forms',
        'api',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
