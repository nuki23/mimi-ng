import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TooltipPage } from './tooltip-page';
import { TOOLTIP_PAGE } from './tooltip.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('TooltipPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TOOLTIP_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(TooltipPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo (el ejemplo básico) y cinco ejemplos.
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        // data-tooltip-state lo pone la directiva (también con [mimiTooltip]="…").
        expect(example?.querySelector('[data-tooltip-state]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/tooltip';");
        expect(code).toMatch(/export class Tooltip\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Tooltip');
      // La página hermana, enlazada desde la nota de Uso.
      expect(
        el.querySelector('[data-slot="usage-note"] a[href="/docs/components/popover"]'),
      ).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
