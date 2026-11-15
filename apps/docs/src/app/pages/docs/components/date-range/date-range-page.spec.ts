import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { DateRangePage } from './date-range-page';
import { DATE_RANGE_PAGE } from './date-range.page';

describe('DateRangePage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(DATE_RANGE_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(DateRangePage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo, «Tamaños» y «Estados»: el vivo de los tres formularios se fue (repetía las
      // pestañas de «Formularios») y sus estados pasaron a «Estados».
      expect(previews.length).toBe(3);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-date-range button[aria-haspopup]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/date-range';");
        expect(code).toMatch(/export class DateRange\w+Example/);
      }
      for (const button of Array.from(
        el.querySelectorAll<HTMLButtonElement>('mimi-date-range button[aria-haspopup]'),
      )) {
        const named =
          button.getAttribute('aria-label') ||
          (button.id && el.querySelector(`label[for="${button.id}"]`));
        expect(named, button.outerHTML).toBeTruthy();
      }
      const days = Array.from(el.querySelectorAll('mimi-date-range [data-slot="days"]')).map((d) =>
        d.textContent?.trim(),
      );
      expect(days).toContain('20 días');
      expect(days).toContain('7 días');
      expect(el.textContent).toContain('1 sept 2026 – 20 sept 2026');
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll('app-date-range-states-example mimi-date-range');
      expect(states[0].hasAttribute('data-disabled')).toBe(true);
      expect(states[1].querySelector('button')!.getAttribute('aria-disabled')).toBe('true');
      expect(states[2].hasAttribute('data-invalid')).toBe(true);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Date Range');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/date-picker"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
