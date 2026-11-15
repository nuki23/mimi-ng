import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { DatePickerPage } from './date-picker-page';
import { DATE_PICKER_PAGE } from './date-picker.page';

describe('DatePickerPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(DATE_PICKER_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(DatePickerPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y tres ejemplos: el vivo de los tres formularios se fue (repetía las pestañas de
      // «Formularios») y sus estados pasaron a «Estados».
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-date-picker, mimi-calendar')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/");
        expect(code).toMatch(/export class DatePicker\w+Example/);
      }
      // Cada botón tiene nombre: aria-label o una etiqueta.
      for (const button of Array.from(
        el.querySelectorAll<HTMLButtonElement>('mimi-date-picker button[aria-haspopup]'),
      )) {
        const named =
          button.getAttribute('aria-label') ||
          (button.id && el.querySelector(`label[for="${button.id}"]`));
        expect(named, button.outerHTML).toBeTruthy();
      }
      const labels = Array.from(el.querySelectorAll('mimi-date-picker button')).map((b) =>
        b.textContent?.trim(),
      );
      // En español, con el formato por defecto; el de en-US, con su formato.
      expect(labels).toContain('30 sept 2026');
      expect(labels).toContain('Wed, September 30, 2026');
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll('app-date-picker-states-example mimi-date-picker');
      expect(states[0].hasAttribute('data-disabled')).toBe(true);
      expect(states[1].querySelector('button')!.getAttribute('aria-readonly')).toBe('true');
      expect(states[2].hasAttribute('data-invalid')).toBe(true);
      // El calendario suelto, en español.
      expect(el.querySelector('mimi-calendar [data-slot="go-today"]')!.textContent?.trim()).toBe(
        'Ir a hoy',
      );
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Date Picker');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/date-range"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
