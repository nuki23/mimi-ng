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
      expect(previews.length).toBe(3);
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
