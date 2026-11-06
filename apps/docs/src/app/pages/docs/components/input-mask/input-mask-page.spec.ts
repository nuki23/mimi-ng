import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { InputMaskPage } from './input-mask-page';

describe('InputMaskPage', () => {
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
      const fixture = TestBed.createComponent(InputMaskPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-input-mask input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/input-mask';");
        expect(code).toMatch(/export class InputMask\w+Example/);
      }
      // Cada campo tiene nombre: aria-label o una etiqueta.
      for (const input of Array.from(
        el.querySelectorAll<HTMLInputElement>('mimi-input-mask input'),
      )) {
        const named =
          input.getAttribute('aria-label') ||
          (input.id && el.querySelector(`label[for="${input.id}"]`));
        expect(named, input.outerHTML).toBeTruthy();
      }
      // Los valores de los estados llegan con la máscara.
      const dates = Array.from(
        el.querySelectorAll<HTMLInputElement>('app-input-mask-states-example input'),
      );
      expect(dates[0].value).toBe('24/12/2026');
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
