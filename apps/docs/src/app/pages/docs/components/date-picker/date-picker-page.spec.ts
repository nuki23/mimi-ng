import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DatePickerPage } from './date-picker-page';

describe('DatePickerPage', () => {
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

      const previews = examples(fixture);
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
      // El sábado que llega del formulario, en español; el de en-US, con su formato.
      expect(labels).toContain('26 sept 2026');
      expect(labels).toContain('Wed, September 30, 2026');
      // El calendario suelto, en español.
      expect(el.querySelector('mimi-calendar [data-slot="go-today"]')!.textContent?.trim()).toBe(
        'Ir a hoy',
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
