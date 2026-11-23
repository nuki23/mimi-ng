import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ColorPickerPage } from './color-picker-page';
import { COLOR_PICKER_PAGE } from './color-picker.page';

describe('ColorPickerPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(COLOR_PICKER_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ColorPickerPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo (con disparador) y dos ejemplos: el vivo de los tres formularios se fue (repetía
      // las pestañas de «Formularios») y solo lectura pasó a «Estados». Más «Tamaños».
      // Más «En el teléfono» (R.34).
      expect(previews.length).toBe(5);
      // M.27: `size` en el disparador, sin contenedor `mimiSize`.
      expect(previews.some(({ code }) => code.includes('<mimi-color-input size="lg"'))).toBe(true);
      const sizes = el.querySelectorAll<HTMLElement>(
        'app-color-picker-sizes-example mimi-color-input',
      );
      expect([...sizes].map((input) => input.dataset['size'] ?? null)).toEqual(['sm', null, 'lg']);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-color-picker, mimi-color-input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/color-picker';");
        expect(code).toMatch(/export class ColorPicker\w+Example/);
      }
      // Textos en español y cada disparador con nombre.
      expect(
        el.querySelector('mimi-color-picker [role="slider"]')!.getAttribute('aria-label'),
      ).toBe('Saturación y brillo');
      for (const button of Array.from(
        el.querySelectorAll<HTMLButtonElement>('mimi-color-input button'),
      )) {
        const named =
          button.getAttribute('aria-label') ||
          (button.id && el.querySelector(`label[for="${button.id}"]`));
        expect(named, button.outerHTML).toBeTruthy();
      }
      expect(el.textContent).toContain('Contraste con blanco');
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll('app-color-picker-states-example mimi-color-input');
      expect(states[0].hasAttribute('data-disabled')).toBe(true);
      expect(states[1].hasAttribute('data-readonly')).toBe(true);
      expect(states[2].hasAttribute('data-invalid')).toBe(true);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Color Picker');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
