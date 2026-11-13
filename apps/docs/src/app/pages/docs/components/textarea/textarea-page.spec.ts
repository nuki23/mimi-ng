import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { TextareaPage } from './textarea-page';

describe('TextareaPage', () => {
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
      const fixture = TestBed.createComponent(TextareaPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(2);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiTextarea]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/textarea';");
        expect(code).not.toContain('@mimi-ng/ui-core');
      }
      // Solo Textarea: ni la instalación ni los ejemplos de Input.
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('[mimiInput]')).toBeNull();
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
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
