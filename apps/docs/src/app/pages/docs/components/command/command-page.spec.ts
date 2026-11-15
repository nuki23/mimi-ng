import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { CommandPage } from './command-page';
import { COMMAND_PAGE } from './command.page';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: HighlighterService,
        useValue: { highlight: () => new Promise(() => undefined) },
      },
    ],
  });
  return TestBed.createComponent(CommandPage);
}

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('CommandPage', () => {
  beforeAll(() => {
    // jsdom no lo implementa; aria lo usa para traer el comando activo a la vista.
    Element.prototype.scrollIntoView ??= () => undefined;
  });

  it('cumple la plantilla', () => expect(validateDocPage(COMMAND_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const fixture = setup();
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // La demo (la paleta en la página), los tamaños y el diálogo con ⌘K.
      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      expect(previews[1].code).toContain('size="lg"');
      expect(previews[1].example?.querySelectorAll('mimi-command').length).toBe(3);
      for (const { code } of previews) {
        expect(code).toContain("from '@/components/ui/command';");
        expect(code).toMatch(/export class Command\w+Example/);
      }
      const inline = previews[0].example!.querySelector('mimi-command')!;
      const field = inline.querySelector('input')!;
      expect(field.getAttribute('aria-label')).toBe('Acciones del proyecto');
      expect(field.getAttribute('placeholder')).toBe('Busca una acción…');
      expect(inline.querySelectorAll('[role="option"]').length).toBe(5);
      // Los textos de la página, en español.
      expect(inline.querySelector('[data-slot="footer"]')!.textContent).toContain('Navegar');
      // El diálogo empieza cerrado: su disparador está.
      expect(previews[2].example?.querySelector('mimi-command-dialog')).not.toBeNull();
      expect(previews[2].example?.querySelector('button')!.textContent).toContain('Buscar…');
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it(
    'el diálogo: al abrirlo, cada comando lleva el ícono de su data',
    async () => {
      const fixture = setup();
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const host = (fixture.nativeElement as HTMLElement).querySelector(
        'app-command-dialog-example',
      )!;
      host.querySelector<HTMLButtonElement>('button')!.click();
      await settle(fixture);
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      expect(dialog).not.toBeNull();
      const options = dialog.querySelectorAll('[role="option"]');
      expect(options.length).toBe(9);
      for (const option of Array.from(options)) {
        expect(
          option.querySelector(
            '[data-slot="icon"] svg path, [data-slot="icon"] svg circle, [data-slot="icon"] svg rect',
          ),
        ).not.toBeNull();
      }
      fixture.destroy();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
