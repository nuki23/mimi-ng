import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { AccordionPage } from './accordion-page';
import { ACCORDION_PAGE } from './accordion.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('AccordionPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(ACCORDION_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(AccordionPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y seis ejemplos.
      expect(previews.length).toBe(7);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-accordion')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/accordion';");
        expect(code).toMatch(/export class Accordion\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Accordion');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
