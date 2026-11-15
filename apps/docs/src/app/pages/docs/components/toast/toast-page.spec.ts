import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { ToastPage } from './toast-page';
import { TOAST_PAGE } from './toast.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('ToastPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TOAST_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(ToastPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // La demo y siete ejemplos.
      const previews = examples(fixture);
      expect(previews.length).toBe(8);
      // Tamaños: un botón por tamaño, y cada uno pide el aviso de su tamaño.
      const sizes = el.querySelector('app-toast-sizes-example')!;
      expect(
        Array.from(sizes.querySelectorAll('button')).map((b) => b.textContent!.trim()),
      ).toEqual(['Aviso sm', 'Aviso md', 'Aviso lg']);
      expect(
        previews.some(
          ({ code }) => code.includes('class ToastSizesExample') && code.includes('size });'),
        ),
      ).toBe(true);
      for (const { example, code } of previews) {
        expect(example?.querySelector('button')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/toast';");
        expect(code).toContain('injectMimiToast()');
        expect(code).toMatch(/export class Toast\w+Example/);
      }
      // Se usa con un servicio: su API va en «Servicio».
      expect(el.querySelector('h3#service')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
