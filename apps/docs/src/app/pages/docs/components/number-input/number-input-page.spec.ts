import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { NumberInputPage } from './number-input-page';
import { NUMBER_INPUT_PAGE } from './number-input.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('NumberInputPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(NUMBER_INPUT_PAGE)).toEqual([]));

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
      // La demo y tres ejemplos: el vivo de Signal Forms, Reactive y ngModel se fue (repetía las
      // pestañas de «Formularios»); «Tamaños» va primero.
      expect(previews.length).toBe(4);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-number-input input[role="spinbutton"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/number-input';");
        expect(code).toMatch(/export class NumberInput\w+Example/);
      }
      // Cada campo tiene nombre: aria-label o un <label for>.
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
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Number Input');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
