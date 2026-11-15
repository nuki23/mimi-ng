import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { BadgePage } from './badge-page';
import { BADGE_PAGE } from './badge.page';

describe('BadgePage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(BadgePage);
    await settle(fixture);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('cumple la plantilla', () => expect(validateDocPage(BADGE_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const { fixture, el } = await setup();
      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo, tres ejemplos y la matriz (en su desplegable).
      expect(previews.length).toBe(5);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiBadge]')).not.toBeNull();
        expect(code).toContain("import { MimiBadge } from '@/components/ui/badge';");
        expect(code).toMatch(/export class Badge\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Badge');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('no muestra los atajos que se quitan (van en el CHANGELOG)', async () => {
    const { el } = await setup();
    // La tabla de variables (compartida) queda fuera.
    const article = el.cloneNode(true) as HTMLElement;
    article.querySelector('app-css-variables')?.remove();
    const text = article.textContent ?? '';
    expect(text).not.toContain('destructive');
    expect(text).not.toMatch(/se quita(n)? en la/);
  });
});
