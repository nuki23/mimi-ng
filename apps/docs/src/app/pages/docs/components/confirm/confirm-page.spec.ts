import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ConfirmPage } from './confirm-page';
import { CONFIRM_PAGE } from './confirm.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('ConfirmPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(CONFIRM_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ConfirmPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // La demo (el caso destructivo) y siete ejemplos (con «Tamaños», R.27).
      const previews = examples(fixture);
      expect(previews.length).toBe(8);
      expect(previews.some(({ code }) => code.includes('size,'))).toBe(true);
      expect(previews[0].code).toContain("tone: 'danger'");
      for (const { example, code } of previews) {
        expect(example?.querySelector('button')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/confirm';");
        expect(code).toContain('injectMimiConfirm()');
        expect(code).toMatch(/export class Confirm\w+Example/);
      }
      // Se usa con un servicio: su API va en «Servicio».
      expect(el.querySelector('h3#service')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
