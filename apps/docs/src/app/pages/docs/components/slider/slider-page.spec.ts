import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SliderPage } from './slider-page';
import { SLIDER_PAGE } from './slider.page';

describe('SliderPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(SLIDER_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(SliderPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y cuatro ejemplos: deshabilitado y solo lectura pasaron a «Estados»; el rango con
      // su validador queda junto a las pestañas de «Formularios».
      expect(previews.length).toBe(5);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-slider [role="slider"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/slider';");
        expect(code).toMatch(/export class Slider\w+Example/);
      }
      // Todos los pulgares tienen nombre (aria-label o la etiqueta).
      for (const thumb of Array.from(el.querySelectorAll('[role="slider"]'))) {
        const named = thumb.getAttribute('aria-label') || thumb.getAttribute('aria-labelledby');
        expect(named, thumb.outerHTML.slice(0, 80)).toBeTruthy();
      }
      // En español: «Precio por noche, Mínimo».
      expect(
        el.querySelector('app-slider-range-example [role="slider"]')!.getAttribute('aria-label'),
      ).toBe('Precio por noche, Mínimo');
      // La distancia mínima del ejemplo de edad: 30–33 no llega a 5 años y se ve el error.
      expect(el.querySelector('app-slider-range-example mimi-slider[data-invalid]')).not.toBeNull();
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll('app-slider-states-example mimi-slider');
      expect(states[0].hasAttribute('data-disabled')).toBe(true);
      expect(states[1].querySelector('[role="slider"]')!.getAttribute('aria-readonly')).toBe(
        'true',
      );
      expect(states[2].hasAttribute('data-invalid')).toBe(true);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Slider');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
