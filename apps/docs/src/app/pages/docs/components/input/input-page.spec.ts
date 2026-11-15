import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { InputPage } from './input-page';

describe('InputPage', () => {
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
      const fixture = TestBed.createComponent(InputPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y cinco ejemplos: los vivos de Reactive Forms, Signal Forms y ngModel se fueron
      // (repetían las pestañas de «Formularios»).
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        expect(example?.querySelector('[mimiInput]')).not.toBeNull();
        // Las importaciones son las del proyecto del usuario, no las del monorepo.
        expect(code).toContain("from '@/components/ui/input';");
        expect(code).not.toContain('@mimi-ng/ui-core');
      }
      expect(el.querySelectorAll('app-install-command').length).toBe(1);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Input');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
