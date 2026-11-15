import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { SkeletonPage } from './skeleton-page';
import { SKELETON_PAGE } from './skeleton.page';

describe('SkeletonPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(SKELETON_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(SkeletonPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y tres ejemplos.
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example).not.toBeNull();
        expect(code).toContain("import { MimiSkeleton } from '@/components/ui/skeleton';");
        expect(code).toMatch(/export class Skeleton\w+Example/);
      }
      // El ejemplo de carga empieza con el contenido; los demás muestran skeletons.
      expect(el.querySelectorAll('mimi-skeleton').length).toBeGreaterThan(0);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Skeleton');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
