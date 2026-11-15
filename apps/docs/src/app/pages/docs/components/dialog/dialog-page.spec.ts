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
      // La demo (antes de Instalación) es el diálogo en la plantilla: el del servicio, en dos
      // archivos, pasa de las 60 líneas de la demo (PENDIENTE DE DECIDIR, usuario).
      const first = el.querySelector('app-code-preview')!;
      expect(first.querySelector('app-dialog-basic-example')).not.toBeNull();
      expect(
        first.compareDocumentPosition(el.querySelector('#installation')!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      // El servicio, en Ejemplos y en dos archivos; las opciones, con chrome: 'none'.
      const service = previews.find(({ example }) =>
        example?.querySelector('app-dialog-edit-user-example'),
      );
      expect(service?.code).toContain('MimiDialogService');
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
    'el ejemplo principal: abre el componente con el usuario, guarda y la página muestra el resultado',
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
        'app-dialog-edit-user-example',
      )!;
      const text = (slot: string) =>
        host.querySelector(`[data-slot="${slot}"]`)!.textContent!.replace(/\s+/g, ' ').trim();
      expect(text('user')).toBe('Ana Torres · Editor');

      host.querySelector<HTMLButtonElement>('button')!.click();
      await settle(fixture);
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
      const name = dialog.querySelector<HTMLInputElement>('input')!;
      // El diálogo recibió el usuario por su entrada.
      expect(name.value).toBe('Ana Torres');
      name.value = 'Ana T. Ruiz';
      name.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
      Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'))
        .find((b) => b.textContent!.trim() === 'Guardar')!
        .click();
      // afterClosed emite al terminar la animación de salida.
      for (let i = 0; i < 10 && text('result') !== 'resultado: guardado'; i++)
        await settle(fixture);
      expect(text('result')).toBe('resultado: guardado');
      expect(text('user')).toBe('Ana T. Ruiz · Editor');
      fixture.destroy();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
