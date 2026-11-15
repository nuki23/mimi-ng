import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DialogPage } from './dialog-page';

describe('DialogPage', () => {
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
      const fixture = TestBed.createComponent(DialogPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      expect(previews.length).toBe(8);
      // La página empieza por el servicio (PD-7, decidido por el usuario el 14/11/2026): la demo,
      // antes de Instalación, en dos archivos (quien abre y el diálogo), 60 líneas como máximo.
      const first = el.querySelector('app-code-preview')!;
      expect(first.querySelector('app-dialog-ask-name-example')).not.toBeNull();
      expect(
        first.compareDocumentPosition(el.querySelector('#installation')!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(previews[0].code).toContain('MimiDialogService');
      // El diálogo en la plantilla pasa a Ejemplos; las opciones, con chrome: 'none'.
      expect(el.querySelector('app-dialog-basic-example')).not.toBeNull();
      expect(previews[1].code).toContain("chrome: 'none'");
      for (const { example, code } of previews) {
        expect(example?.querySelector('button')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/dialog';");
        expect(code).toMatch(/export class Dialog\w+Example/);
      }
      expect(el.querySelectorAll('[mimiDialogTrigger][aria-haspopup="dialog"]').length).toBe(5);
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it(
    'la demo: abre el diálogo con el nombre, guarda y la página muestra el resultado',
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
      const fixture = TestBed.createComponent(DialogPage);
      document.body.appendChild(fixture.nativeElement);
      await settle(fixture);
      const host = (fixture.nativeElement as HTMLElement).querySelector(
        'app-dialog-ask-name-example',
      )!;
      const text = () =>
        host.querySelector('[data-slot="result"]')!.textContent!.replace(/\s+/g, ' ').trim();
      expect(text()).toBe('Hola, Ana');

      host.querySelector<HTMLButtonElement>('button')!.click();
      await settle(fixture);
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const name = dialog.querySelector<HTMLInputElement>('input')!;
      // El diálogo recibió el nombre por su entrada.
      expect(name.value).toBe('Ana');
      name.value = 'Ana Ruiz';
      name.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
      Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'))
        .find((b) => b.textContent!.trim() === 'Guardar')!
        .click();
      // afterClosed emite al terminar la animación de salida.
      for (let i = 0; i < 10 && text() !== 'Hola, Ana Ruiz'; i++) await settle(fixture);
      expect(text()).toBe('Hola, Ana Ruiz');
      fixture.destroy();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
