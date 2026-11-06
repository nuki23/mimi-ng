import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { FileUploadPage } from './file-upload-page';

describe('FileUploadPage', () => {
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

      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-file-upload, mimi-file-list')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/file-upload';");
        expect(code).toMatch(/export class FileUpload\w+Example/);
      }
      // Textos en español y los archivos ya subidos.
      expect(
        el.querySelector('mimi-file-upload button [data-slot="title"]')!.textContent?.trim(),
      ).toBe('Arrastra archivos o haz clic');
      const names = Array.from(el.querySelectorAll('mimi-file-item [data-slot="name"]')).map((n) =>
        n.textContent?.trim(),
      );
      expect(names).toEqual(['contrato.pdf', 'presupuesto.xlsx', 'demo.mp4']);
      expect(el.querySelector('mimi-file-item [data-slot="size"]')!.textContent?.trim()).toBe(
        '182 kB',
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
