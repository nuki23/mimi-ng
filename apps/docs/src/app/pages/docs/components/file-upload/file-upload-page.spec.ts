import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { FileUploadPage } from './file-upload-page';
import { FILE_UPLOAD_PAGE } from './file-upload.page';

describe('FileUploadPage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(FILE_UPLOAD_PAGE)).toEqual([]));

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
      const fixture = TestBed.createComponent(FileUploadPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y tres ejemplos: el vivo de los tres formularios se fue (repetía las pestañas de
      // «Formularios») y solo lectura pasó a «Estados». Y «Tamaños» (M.27).
      expect(previews.length).toBe(5);
      const sizes = el.querySelectorAll<HTMLElement>(
        'app-file-upload-sizes-example mimi-file-upload',
      );
      expect([...sizes].map((zone) => zone.dataset['size'])).toEqual(['sm', 'md', 'lg']);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-file-upload, mimi-file-list')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/file-upload';");
        expect(code).toMatch(/export class FileUpload\w+Example/);
      }
      // El título visible es el nombre accesible de la zona.
      const demo = el.querySelector<HTMLButtonElement>('app-file-upload-demo-example button')!;
      const title = demo.querySelector('[data-slot="title"]')!;
      expect(title.textContent?.trim()).toBe('Adjunta tus facturas');
      expect(demo.getAttribute('aria-labelledby')).toContain(title.id);
      // Textos en español (el título por defecto) y los archivos ya subidos.
      expect(
        el
          .querySelector('app-file-upload-basic-example button [data-slot="title"]')!
          .textContent?.trim(),
      ).toBe('Arrastra archivos o haz clic');
      const names = Array.from(el.querySelectorAll('mimi-file-item [data-slot="name"]')).map((n) =>
        n.textContent?.trim(),
      );
      expect(names).toEqual(['contrato.pdf', 'presupuesto.xlsx', 'demo.mp4']);
      expect(el.querySelector('mimi-file-item [data-slot="size"]')!.textContent?.trim()).toBe(
        '182 kB',
      );
      // Estados: deshabilitado, solo lectura y con error.
      const states = el.querySelectorAll('app-file-upload-states-example mimi-file-upload');
      expect(states[0].hasAttribute('data-disabled')).toBe(true);
      expect(states[1].querySelector('button')!.getAttribute('aria-disabled')).toBe('true');
      expect(states[2].hasAttribute('data-invalid')).toBe(true);
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('File Upload');
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
