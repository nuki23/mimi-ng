import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { StepperPage } from './stepper-page';
import { STEPPER_PAGE } from './stepper.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('StepperPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(STEPPER_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(StepperPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo y cinco ejemplos.
      expect(previews.length).toBe(6);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-stepper ol')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/stepper';");
        expect(code).toMatch(/export class Stepper\w+Example/);
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Stepper');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
