import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { PasswordPage } from './password-page';
import { PASSWORD_PAGE } from './password.page';

describe('PasswordPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(PASSWORD_PAGE)).toEqual([]));

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

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo (contraseña nueva) y cinco ejemplos: el de solo lectura pasó a «Estados».
      expect(previews.length).toBe(6);
      expect(previews.some(({ code }) => code.includes('size="lg"'))).toBe(true);
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
      // Solo lectura (en «Estados»): el input queda readonly y el ojo sigue habilitado.
      const readonly = el.querySelector('app-password-states-example mimi-password[readonly]')!;
      expect(readonly.querySelector<HTMLInputElement>('input')!.readOnly).toBe(true);
      expect(readonly.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!.disabled).toBe(
        false,
      );
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Password');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
