import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ProgressPage } from './progress-page';
import { PROGRESS_PAGE } from './progress.page';

describe('ProgressPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(PROGRESS_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ProgressPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y cinco ejemplos.
      expect(previews.length).toBe(6);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-progress[role="progressbar"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/progress';");
        expect(code).toMatch(/export class Progress\w+Example/);
      }
      // Todas tienen nombre.
      for (const bar of Array.from(el.querySelectorAll('mimi-progress'))) {
        const name = bar.getAttribute('aria-label') ?? bar.getAttribute('aria-labelledby');
        expect(name, bar.outerHTML.slice(0, 80)).toBeTruthy();
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Progress');
      // El Toast, enlazado desde la accesibilidad.
      expect(el.querySelector('a[href="/docs/components/toast"]')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
