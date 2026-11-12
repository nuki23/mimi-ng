import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { InputOtpPage } from './input-otp-page';

describe('InputOtpPage', () => {
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
      expect(previews.length).toBe(6);
      // El primero es el interactivo: 8 casillas en dos mitades, y el código que lo hace.
      const playground = previews[0].example!;
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
      // Signal Forms y Reactive Forms tienen su ejemplo propio.
      expect(el.querySelector('app-input-otp-signal-forms-example mimi-input-otp')).not.toBeNull();
      expect(
        el.querySelector('app-input-otp-reactive-forms-example mimi-input-otp'),
      ).not.toBeNull();
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
      expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
        'installation',
        'usage',
        'examples',
        'api',
      ]);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
