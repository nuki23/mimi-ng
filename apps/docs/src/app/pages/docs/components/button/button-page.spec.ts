import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ButtonPage } from './button-page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('ButtonPage', () => {
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
      const fixture = TestBed.createComponent(ButtonPage);
      await settle(fixture);

      const previews = examples(fixture);
      // La demo, seis ejemplos y la matriz (en su desplegable).
      expect(previews.length).toBe(8);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiBtn]')).not.toBeNull();
        // La importación es la del proyecto del usuario, no la del monorepo.
        expect(code).toContain("import { MimiButton } from '@/components/ui/button';");
        expect(code).toMatch(/export class Button\w+Example/);
      }
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('no muestra los atajos que se quitan (van en el CHANGELOG)', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(ButtonPage);
    await settle(fixture);
    // La tabla de variables (compartida, con sus propias pruebas) queda fuera.
    const article = (fixture.nativeElement as HTMLElement).cloneNode(true) as HTMLElement;
    article.querySelector('app-css-variables')?.remove();
    const text = article.textContent ?? '';
    expect(text).not.toContain('destructive');
    expect(text).not.toMatch(/se quita(n)? en la/);
  });
});
