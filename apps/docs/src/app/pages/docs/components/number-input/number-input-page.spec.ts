import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { NumberInputPage } from './number-input-page';

describe('NumberInputPage', () => {
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
      const fixture = TestBed.createComponent(NumberInputPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-number-input input[role="spinbutton"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/number-input';");
        expect(code).toMatch(/export class NumberInput\w+Example/);
      }
      // Cada campo tiene nombre: aria-label, o la etiqueta de mimi-form-field.
      for (const input of Array.from(
        el.querySelectorAll<HTMLInputElement>('mimi-number-input input'),
      )) {
        const named =
          input.getAttribute('aria-label') ||
          (input.id && el.querySelector(`label[for="${input.id}"]`));
        expect(named, input.outerHTML).toBeTruthy();
      }
      // Los botones, en español.
      expect(el.querySelector('[data-slot="decrement"]')!.getAttribute('aria-label')).toBe(
        'Disminuir Cantidad',
      );
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
