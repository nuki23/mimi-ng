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
      // Revisión de accesibilidad (S1): ningún botón de los ejemplos se deshabilita con
      // `disabled` (al llegar al primer o al último paso, el foco caía a <body>): aria-disabled.
      const buttons = Array.from(
        el.querySelectorAll<HTMLButtonElement>('[data-slot="example"] button[mimiBtn]'),
      );
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) expect(button.disabled, button.textContent!).toBe(false);
      const back = buttons.filter((b) => b.textContent!.trim() === 'Atrás');
      expect(back.length).toBe(3);
      // Los dos lineales empiezan en el primer paso (el demo, en el tercero).
      expect(back.filter((b) => b.getAttribute('aria-disabled') === 'true').length).toBe(2);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
