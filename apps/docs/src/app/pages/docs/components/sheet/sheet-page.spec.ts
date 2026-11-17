import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SheetPage } from './sheet-page';
import { SHEET_PAGE } from './sheet.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('SheetPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(SHEET_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(SheetPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y tres ejemplos.
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-sheet')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/sheet';");
        expect(code).toMatch(/export class Sheet\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Sheet');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
