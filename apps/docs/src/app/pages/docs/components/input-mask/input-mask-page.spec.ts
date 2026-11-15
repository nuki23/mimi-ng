import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { InputMaskPage } from './input-mask-page';
import { INPUT_MASK_PAGE } from './input-mask.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('InputMaskPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(INPUT_MASK_PAGE)).toEqual([]));

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
      // La demo (teléfono y fecha) y tres ejemplos: la tarjeta salió de la demo a su propio
      // ejemplo, `class` salió de Estados, y el vivo de los tres formularios se fue (repetía las
      // pestañas de «Formularios»). Y «Tamaños».
      expect(previews.length).toBe(5);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
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
      expect(el.querySelector<HTMLInputElement>('app-input-mask-custom-example input')!.value).toBe(
        '482-913',
      );
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Input Mask');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
