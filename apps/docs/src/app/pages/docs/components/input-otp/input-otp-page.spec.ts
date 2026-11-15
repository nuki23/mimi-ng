import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { InputOtpPage } from './input-otp-page';
import { INPUT_OTP_PAGE } from './input-otp.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('InputOtpPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(INPUT_OTP_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(InputOtpPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      // La demo (verificación) y tres ejemplos: los vivos de Signal Forms y Reactive Forms se
      // fueron (repetían las pestañas de «Formularios»). Y «Tamaños» (M.27).
      expect(previews.length).toBe(5);
      const sizes = el.querySelectorAll<HTMLElement>('app-input-otp-sizes-example mimi-input-otp');
      expect([...sizes].map((otp) => otp.dataset['size'])).toEqual(['sm', 'md', 'lg']);
      // El interactivo: 8 casillas en dos mitades, y el código que lo hace.
      const playground = el.querySelector<HTMLElement>('app-input-otp-playground-example')!;
      expect(playground.querySelectorAll('mimi-input-otp [data-slot="box"]').length).toBe(8);
      expect(playground.querySelectorAll('mimi-input-otp [data-slot="separator"]').length).toBe(1);
      expect(playground.querySelector('pre')!.textContent).toContain(
        '<mimi-input-otp [length]="8" [separatorAfter]="[4]" />',
      );
      // Separador propio: «·» dos veces y un ícono.
      const separators = Array.from(
        el.querySelectorAll<HTMLElement>(
          'app-input-otp-separator-example mimi-input-otp [data-slot="separator"]',
        ),
      );
      expect(separators.map((s) => s.textContent!.trim())).toEqual(['·', '·', '']);
      expect(separators[2].querySelector('svg')).not.toBeNull();
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-input-otp input')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/input-otp';");
        expect(code).toMatch(/export class InputOtp\w+Example/);
      }
      for (const input of Array.from(
        el.querySelectorAll<HTMLInputElement>('mimi-input-otp input'),
      )) {
        const named =
          input.getAttribute('aria-label') ||
          (input.id && el.querySelector(`label[for="${input.id}"]`));
        expect(named, input.outerHTML).toBeTruthy();
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Input OTP');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
