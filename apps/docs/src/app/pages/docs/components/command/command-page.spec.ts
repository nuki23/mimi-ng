import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { CommandPage } from './command-page';

describe('CommandPage', () => {
  beforeAll(() => {
    // jsdom no lo implementa; aria lo usa para traer el comando activo a la vista.
    Element.prototype.scrollIntoView ??= () => undefined;
  });

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
      const fixture = TestBed.createComponent(CommandPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(2);
      for (const { code } of previews) {
        expect(code).toContain("from '@/components/ui/command';");
        expect(code).toMatch(/export class Command\w+Example/);
      }
      // El diálogo empieza cerrado: su disparador está; la paleta en la página, con su lista.
      expect(previews[0].example?.querySelector('mimi-command-dialog')).not.toBeNull();
      expect(previews[0].example?.querySelector('button')!.textContent).toContain('Buscar…');
      const inline = previews[1].example!.querySelector('mimi-command')!;
      const field = inline.querySelector('input')!;
      expect(field.getAttribute('aria-label')).toBe('Acciones del proyecto');
      expect(field.getAttribute('placeholder')).toBe('Busca una acción…');
      expect(inline.querySelectorAll('[role="option"]').length).toBe(5);
      // Los textos de la página, en español.
      expect(inline.querySelector('[data-slot="footer"]')!.textContent).toContain('Navegar');
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
