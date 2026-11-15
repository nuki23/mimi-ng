import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SeparatorPage } from './separator-page';
import { SEPARATOR_PAGE } from './separator.page';

describe('SeparatorPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(SEPARATOR_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(SeparatorPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y tres ejemplos.
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-separator')).not.toBeNull();
        expect(code).toContain("import { MimiSeparator } from '@/components/ui/separator';");
        expect(code).toMatch(/export class Separator\w+Example/);
      }
      // Solo el ejemplo semántico se anuncia.
      expect(el.querySelectorAll('mimi-separator[role="separator"]').length).toBe(1);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Separator');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
