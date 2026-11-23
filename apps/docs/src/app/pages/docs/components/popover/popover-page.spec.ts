import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { PopoverPage } from './popover-page';
import { POPOVER_PAGE } from './popover.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('PopoverPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(POPOVER_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(PopoverPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo (el ejemplo básico) y seis ejemplos, con «En el teléfono» (R.34).
      expect(previews.length).toBe(7);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-popover [mimiPopoverTrigger]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/popover';");
        expect(code).toMatch(/export class Popover\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Popover');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
