import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { CardPage } from './card-page';
import { CARD_PAGE } from './card.page';

describe('CardPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(CARD_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(CardPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y seis ejemplos (R.19).
      expect(previews.length).toBe(7);
      for (const { example, code } of previews) {
        // La forma nueva: la directiva en tu elemento, nunca el elemento de la 0.6.0.
        expect(example?.querySelector('[mimiCard]')).not.toBeNull();
        expect(example?.querySelector('mimi-card')).toBeNull();
        expect(code).not.toContain('<mimi-card');
        expect(code).toContain("import { MimiCardImports } from '@/components/ui/card';");
        expect(code).toMatch(/export class Card\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Card');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
