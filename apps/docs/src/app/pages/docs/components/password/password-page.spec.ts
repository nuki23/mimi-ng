import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { PasswordPage } from './password-page';

describe('PasswordPage', () => {
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
      const fixture = TestBed.createComponent(PasswordPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(5);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-password input[mimiInput]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/password';");
        expect(code).toMatch(/export class Password\w+Example/);
      }
      // Los niveles del diseño: débil, media y fuerte.
      const levels = Array.from(
        el.querySelectorAll('app-password-levels-example mimi-password'),
      ).map((p) => p.getAttribute('data-level'));
      expect(levels).toEqual(['1', '2', '3']);
      // El botón, en español.
      expect(el.querySelector('[data-slot="toggle"]')!.getAttribute('aria-label')).toBe(
        'Mostrar contraseña',
      );
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
